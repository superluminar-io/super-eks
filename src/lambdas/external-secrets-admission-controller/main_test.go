package main

import (
	"encoding/json"
	"fmt"
	"testing"

	"github.com/stretchr/testify/assert"
	corev1 "k8s.io/api/core/v1"
	v1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

const annotationKey = "externalsecrets.kubernetes-client.io/permitted-key-name"

var annotationPath = fmt.Sprintf(
	"/annotations/%s",
	annotationKey,
)

func testCalculateAnnotationsAlreadyExist(t *testing.T) {
	nsName := "test-namespace"
	expectedAnnotationValue := fmt.Sprintf(
		"/super-eks/%s/\\.*|/super-eks/global/\\.*",
		nsName,
	)
	namespace := corev1.Namespace{
		ObjectMeta: v1.ObjectMeta{
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
	nsName := "test-namespace"
	expectedAnnotationValue := fmt.Sprintf(
		"/super-eks/%s/\\.*|/super-eks/global/\\.*",
		nsName,
	)
	namespace := corev1.Namespace{
		ObjectMeta: v1.ObjectMeta{
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
