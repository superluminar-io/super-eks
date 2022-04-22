package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"

	log "github.com/sirupsen/logrus"

	v1beta1 "k8s.io/api/admission/v1beta1"
	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/runtime/schema"
	"k8s.io/apimachinery/pkg/runtime/serializer"
)

const code = http.StatusNotAcceptable

// Errors returned when a bad request is received or a failure reason is not provided.
var (
	ErrMissingFailure = errors.New("webhook: reached invalid state, no failure reason found")
	ErrBadRequest     = errors.New("webhook: bad request")
)

var (
	runtimeScheme    = runtime.NewScheme()
	codecs           = serializer.NewCodecFactory(runtimeScheme)
	deserializer     = codecs.UniversalDeserializer()
	namespaceDefault = &schema.GroupVersionKind{
		Group:   "core",
		Version: "v1",
		Kind:    "Namespace",
	}
)

// Errors returned when a request or resource expectation fails.
var (
	ErrInvalidContentType = errors.New("webhook: invalid content type; expected application/json")
	ErrMissingContentType = errors.New("webhook: missing content-type header")
	ErrObjectNotFound     = errors.New("webhook: request did not include object")
	ErrUnexpectedResource = errors.New("webhook: expected pod resource")
	ErrInvalidAdmission   = errors.New("webhook: admission request was nil")
)

// Handler of the lambda
func Handler(ctx context.Context, event events.APIGatewayProxyRequest) (*v1beta1.AdmissionReview, error) {
	request, err := NewRequestFromEvent(event) // 1
	if err != nil {
		log.Errorf("Error creating request from event: %v", err)
		return BadRequestResponse(err)
	}

	response, err := NewResponseFromRequest(request) // 2
	if err != nil {
		log.Errorf("Error crafting response from request: %v", err)
		return BadRequestResponse(err)
	}

	ns, err := request.UnmarshalNamespace() // 3
	if err != nil {
		log.Errorf("Error unmarshalling Namespace: %v", err)
		return response.FailMutation(code, err)
	}
	patch, err := CalculateAnnotations(ns)

	if err != nil {
		log.Errorf("Error marshalling patch: %v", err)
		return response.FailMutation(code, err)
	}
	return response.PassMutation(patch), nil // 8
}

func main() {
	lambda.Start(Handler)
}

// BadRequestResponse is the response returned to the cluster when a bad request is sent.
func BadRequestResponse(err error) (*v1beta1.AdmissionReview, error) {
	response := &v1beta1.AdmissionResponse{
		Allowed: false,
		Result: &metav1.Status{
			Status:  metav1.StatusFailure,
			Message: err.Error(),
			Reason:  metav1.StatusReasonBadRequest,
			Code:    400,
		},
	}
	return respond(response), nil
}

// Response encapsulates the AdmissionResponse sent to API Gateway.
type Response struct {
	Admission *v1beta1.AdmissionResponse
}

// NewResponseFromRequest creates a Response from a Request.
func NewResponseFromRequest(r *Request) (*Response, error) {
	if r == nil || r.Admission == nil {
		return nil, ErrBadRequest
	}
	if r.Admission != nil && r.Admission.UID == "" {
		return nil, ErrBadRequest
	}
	return &Response{
		Admission: &v1beta1.AdmissionResponse{
			UID: r.Admission.UID,
		},
	}, nil
}

// FailMutation populates the AdmissionResponse with the failure contents
// (message and error) and returns the AdmissionReview JSON body response for API Gateway.
func (r *Response) FailMutation(code int32, failure error) (*v1beta1.AdmissionReview, error) {
	if failure == nil {
		return nil, ErrMissingFailure
	}

	r.Admission.Allowed = false
	r.Admission.Result = &metav1.Status{
		Status:  metav1.StatusFailure,
		Message: failure.Error(),
		// Need a better way to Code with Reason; maybe use gRPC code mappings?
		Reason: metav1.StatusReasonNotAcceptable,
		Code:   code,
	}
	return respond(r.Admission), nil
}

// PassMutation populates the AdmissionResponse with the pass contents
// (message) and returns the AdmissionReview JSON response for API Gateway.
func (r *Response) PassMutation(patch []byte) *v1beta1.AdmissionReview {
	r.Admission.Result = &metav1.Status{
		Status:  metav1.StatusSuccess,
		Message: "Nothing to do, all fine, move along",
		Code:    200,
	}
	r.Admission.Allowed = true

	if patch != nil {
		pT := v1beta1.PatchTypeJSONPatch
		r.Admission.PatchType = &pT
		r.Admission.Patch = patch
	}
	return respond(r.Admission)
}

func respond(admission *v1beta1.AdmissionResponse) *v1beta1.AdmissionReview {
	return &v1beta1.AdmissionReview{
		TypeMeta: metav1.TypeMeta{
			Kind:       "AdmissionReview",
			APIVersion: "admission.k8s.io/v1beta1",
		},
		Response: admission,
	}
}

// Request encapsulates the AdmissionRequest from the
// AdmissionReview proxied to the Lambda function.
type Request struct {
	Admission *v1beta1.AdmissionRequest
}

// NewRequestFromEvent creates a Request from the APIGatewayProxyRequest.
func NewRequestFromEvent(event events.APIGatewayProxyRequest) (*Request, error) {
	val, ok := event.Headers["content-type"]
	if !ok {
		return nil, ErrMissingContentType
	}
	if val != "application/json" {
		return nil, ErrInvalidContentType
	}
	var review v1beta1.AdmissionReview
	if _, _, err := deserializer.Decode([]byte(event.Body), nil, &review); err != nil {
		return nil, err
	}
	return &Request{Admission: review.Request}, nil
}

// UnmarshalNamespace unmarshals the raw object in the AdmissionRequest into a Namespace.
func (r *Request) UnmarshalNamespace() (*corev1.Namespace, error) {
	if r.Admission == nil {
		return nil, ErrInvalidAdmission
	}
	if len(r.Admission.Object.Raw) == 0 {
		return nil, ErrObjectNotFound
	}
	if r.Admission.Kind.Kind != namespaceDefault.Kind {
		// If the ValidatingWebhookConfiguration was given additional resource scopes.
		log.Errorf("unknown admission kind: %v", r.Admission.Kind.Kind)
		return nil, ErrUnexpectedResource
	}

	var ns corev1.Namespace
	if err := json.Unmarshal(r.Admission.Object.Raw, &ns); err != nil {
		return nil, err
	}

	return &ns, nil
}

// CalculateAnnotations checks the annotations of the namespace
func CalculateAnnotations(ns *corev1.Namespace) ([]byte, error) {
	annotation := fmt.Sprintf(
		"(/super-eks/%s/\\.*|/super-eks/global/\\.*)",
		ns.Name,
	)
	for k, v := range ns.Annotations {
		if k == "externalsecrets.kubernetes-client.io/permitted-key-name" {
			if v == annotation {
				return nil, nil
			}
			return json.Marshal(
				[]map[string]string{
					{
						"op":    "replace",
						"path":  "/annotations/externalsecrets.kubernetes-client.io/permitted-key-name",
						"value": annotation,
					},
				},
			)
		}
	}
	return json.Marshal(
		[]map[string]string{
			{
				"op":    "add",
				"path":  fmt.Sprintf("/annotations/externalsecrets.kubernetes-client.io/permitted-key-name"),
				"value": annotation,
			},
		},
	)
}
