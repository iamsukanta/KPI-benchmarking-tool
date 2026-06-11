from django.http import Http404
from rest_framework.views import exception_handler
from rest_framework.status import HTTP_422_UNPROCESSABLE_ENTITY, HTTP_404_NOT_FOUND
from rest_framework.exceptions import APIException, ValidationError


def volulink_exception_handler(exc, context):
    response = exception_handler(exc, context)
    if not response:
        return response
    
    if isinstance(exc, ValidationError):
        response.status_code = HTTP_422_UNPROCESSABLE_ENTITY
        response.data = {
            'status': 'error',
            'errors': response.data
        }
    elif isinstance(exc, APIException):
        response.data = {
            'status': 'error',
            'message': response.data.get('detail', 'Es ist ein Fehler aufgetreten.')
        }
    elif isinstance(exc, Http404):
        response.status_code = HTTP_404_NOT_FOUND
        response.data = {
            'status': 'error',
            'message': 'Leider konnten wir keinen passenden Artikel finden.'
        }
    return response
