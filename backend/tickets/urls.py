from django.urls import path
from .views import TicketViewSet, TicketStatsAPIView, TicketClassifyAPIView


ticket_list = TicketViewSet.as_view({
    'get': 'list',
    'post': 'create',
})

ticket_detail = TicketViewSet.as_view({
    'patch': 'partial_update',
    'get': 'retrieve',
})

urlpatterns = [
    path('tickets/', ticket_list, name='ticket-list'),
    path('tickets/<int:pk>/', ticket_detail, name='ticket-detail'),
    path('tickets/stats/', TicketStatsAPIView.as_view(), name='ticket-stats'),
    path('tickets/classify/', TicketClassifyAPIView.as_view(), name='ticket-classify'),
]