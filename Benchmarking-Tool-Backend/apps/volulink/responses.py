from rest_framework import status as http_status
from rest_framework.response import Response


class SuccessResponse(Response):
    def __init__(self, **kwargs):
        data = {
            'status': 'success',
            **kwargs,
        }
        super().__init__(data, kwargs.pop('status', http_status.HTTP_200_OK))


class SuccessWithResultsResponse(Response):
    def __init__(self, results, **kwargs):
        results_name = kwargs.pop('results_name', 'results')
        data = {
            'status': 'success',
            results_name: results,
            **kwargs
        }
        super().__init__(data, http_status.HTTP_200_OK)


class SuccessWithMessageResponse(Response):
    def __init__(self, message, **kwargs):
        status = kwargs.pop('status', http_status.HTTP_200_OK)
        data = {
            'status': 'success',
            'message': message,
            **kwargs
        }
        super().__init__(data, status)


class ErrorResponse(Response):
    def __init__(self, status):
        data = {
            'status': 'error',
        }
        super().__init__(data, status)


class ErrorWithMessageResponse(Response):
    def __init__(self, message, status=http_status.HTTP_400_BAD_REQUEST, **kwargs):
        data = {
            'status': 'error',
            'message': message,
            **kwargs
        }
        super().__init__(data, status)
