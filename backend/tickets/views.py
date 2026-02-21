from django.db.models import Avg, Count, Q
from django.db.models.functions import TruncDate
from rest_framework import status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.filters import SearchFilter
from django_filters.rest_framework import DjangoFilterBackend

from .llm import classify_description
from .models import Ticket
from .serializers import TicketSerializer, TicketClassifySerializer


class TicketViewSet(viewsets.ModelViewSet):
    queryset = Ticket.objects.all().order_by('-created_at')
    serializer_class = TicketSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ['category', 'priority', 'status']
    search_fields = ['title', 'description']


class TicketStatsAPIView(APIView):
    def get(self, request):
        qs = Ticket.objects.all()

        totals = qs.aggregate(
            total=Count('id'),
            open=Count('id', filter=Q(status=Ticket.Status.OPEN)),
        )

        daily_counts = (
            qs.annotate(day=TruncDate('created_at'))
            .values('day')
            .annotate(count=Count('id'))
        )
        avg_per_day = daily_counts.aggregate(avg=Avg('count'))['avg'] or 0

        priority_counts = qs.aggregate(
            low=Count('id', filter=Q(priority=Ticket.Priority.LOW)),
            medium=Count('id', filter=Q(priority=Ticket.Priority.MEDIUM)),
            high=Count('id', filter=Q(priority=Ticket.Priority.HIGH)),
            critical=Count('id', filter=Q(priority=Ticket.Priority.CRITICAL)),
        )

        category_counts = qs.aggregate(
            billing=Count('id', filter=Q(category=Ticket.Category.BILLING)),
            technical=Count('id', filter=Q(category=Ticket.Category.TECHNICAL)),
            account=Count('id', filter=Q(category=Ticket.Category.ACCOUNT)),
            general=Count('id', filter=Q(category=Ticket.Category.GENERAL)),
        )

        data = {
            'total_tickets': totals['total'],
            'open_tickets': totals['open'],
            'avg_tickets_per_day': round(float(avg_per_day), 1) if avg_per_day else 0,
            'priority_breakdown': {
                'low': priority_counts['low'],
                'medium': priority_counts['medium'],
                'high': priority_counts['high'],
                'critical': priority_counts['critical'],
            },
            'category_breakdown': {
                'billing': category_counts['billing'],
                'technical': category_counts['technical'],
                'account': category_counts['account'],
                'general': category_counts['general'],
            },
        }
        return Response(data)


class TicketClassifyAPIView(APIView):
    def post(self, request):
        serializer = TicketClassifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        description = serializer.validated_data['description']

        result = classify_description(description)
        return Response(
            {
                'suggested_category': result['category'],
                'suggested_priority': result['priority'],
            },
            status=status.HTTP_200_OK,
        )