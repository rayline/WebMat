from django.http import HttpResponse
from django.http import HttpResponseBadRequest
import json
import numpy

def calc(request):
    reqJSON = request.body.decode("utf-8")
    req = json.loads(reqJSON)
    try:
        if req["operation"]=="multi":
            x = numpy.array(req["args"][0])
            y = numpy.array(req["args"][1])
            z = numpy.dot(x,y)
            return HttpResponse(json.dumps(z.tolist()))
        elif req["operation"]=="det":
            x = numpy.array(req["args"][0])
            z = numpy.linalg.det(x)
            return HttpResponse(json.dumps(z))
        elif req["operation"]=="inv":
            x = numpy.array(req["args"][0])
            z = numpy.linalg.inv(x)
            return HttpResponse(json.dumps(z.tolist()))
        return HttpResponseBadRequest
    except :
        return HttpResponseBadRequest


