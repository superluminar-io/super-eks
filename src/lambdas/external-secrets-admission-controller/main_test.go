package main

import (
	"encoding/json"
	"fmt"
	"testing"

	"github.com/aws/aws-lambda-go/events"
	"github.com/stretchr/testify/assert"
	"k8s.io/api/admission/v1beta1"
	v1 "k8s.io/api/authentication/v1"
	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

const (
	annotationKey = "externalsecrets.kubernetes-client.io/permitted-key-name"
	nsName        = "test-namespace"
)

var groupVersionKind = &metav1.GroupVersionKind{
	Group:   "core",
	Version: "v1",
	Kind:    "Namespace",
}

var annotationPath = fmt.Sprintf(
	"/annotations/%s",
	annotationKey,
)

func testCalculateAnnotationsAlreadyExist(t *testing.T) {
	expectedAnnotationValue := fmt.Sprintf(
		"/super-eks/%s/\\.*|/super-eks/global/\\.*",
		nsName,
	)
	namespace := corev1.Namespace{
		ObjectMeta: metav1.ObjectMeta{
			Name: nsName,
			Annotations: map[string]string{
				annotationKey: expectedAnnotationValue,
			},
		},
		Spec: corev1.NamespaceSpec{
			Finalizers: []corev1.FinalizerName{},
		},
		Status: corev1.NamespaceStatus{
			Phase:      "",
			Conditions: []corev1.NamespaceCondition{},
		},
	}

	patchBytes, err := CalculateAnnotations(&namespace)

	assert.NoError(t, err)
	assert.NotNil(t, patchBytes)

	patch := map[string]string{}
	{
		err := json.Unmarshal(patchBytes, &patch)
		assert.NoError(t, err)
	}
	assert.Contains(t, patch, "op")
	assert.Equal(t, "replace", patch["op"])
	assert.Contains(t, patch, "path")
	assert.Equal(t, annotationPath, patch["path"])
	assert.Contains(t, patch, "value")
	assert.Equal(t, expectedAnnotationValue, patch["value"])
}

func testCalculateAnnotationsNonExistent(t *testing.T) {
	expectedAnnotationValue := fmt.Sprintf(
		"/super-eks/%s/\\.*|/super-eks/global/\\.*",
		nsName,
	)
	namespace := corev1.Namespace{
		ObjectMeta: metav1.ObjectMeta{
			Name: nsName,
			Annotations: map[string]string{
				annotationKey: expectedAnnotationValue,
			},
		},
		Spec: corev1.NamespaceSpec{
			Finalizers: []corev1.FinalizerName{},
		},
		Status: corev1.NamespaceStatus{
			Phase:      "",
			Conditions: []corev1.NamespaceCondition{},
		},
	}

	patchBytes, err := CalculateAnnotations(&namespace)

	assert.NoError(t, err)
	assert.NotNil(t, patchBytes)

	patch := map[string]string{}
	{
		err := json.Unmarshal(patchBytes, &patch)
		assert.NoError(t, err)
	}
	assert.Contains(t, patch, "op")
	assert.Equal(t, "add", patch["op"])
	assert.Contains(t, patch, "path")
	assert.Equal(t, annotationPath, patch["path"])
	assert.Contains(t, patch, "value")
	assert.Equal(t, expectedAnnotationValue, patch["value"])
}

func TestRequestFromEventSuccess(t *testing.T) {
	requestBody, _ := json.Marshal(
		v1beta1.AdmissionRequest{
			Kind:        *groupVersionKind,
			RequestKind: groupVersionKind,
			Name:        nsName,
			Namespace:   nsName,
			Operation:   "CREATE",
			UserInfo:    v1.UserInfo{},
			DryRun:      boolPtr(false),
		},
	)
	event := events.APIGatewayProxyRequest{
		Headers: map[string]string{
			"content-type": "application/json",
		},
		Body: string(requestBody),
	}
	fmt.Printf("%#v", event)
	r, err := NewRequestFromEvent(event)

	assert.NoError(t, err)
	assert.NotNil(t, r)
}

func boolPtr(b bool) *bool {
	return &b
}
