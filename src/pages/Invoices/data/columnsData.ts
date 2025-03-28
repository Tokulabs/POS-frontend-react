export const columns = [
  {
    title: '# Factura',
    dataIndex: 'invoice_number',
    key: 'invoice_number',
  },
  {
    title: 'Vendido por Por',
    dataIndex: 'sale_by_name',
    key: 'sale_by_name',
  },
  {
    title: 'Fecha',
    dataIndex: 'created_at',
    key: 'created_at',
  },
  {
    title: 'Total',
    dataIndex: 'total',
    key: 'total',
  },
  {
    title: 'Moneda de Pago',
    dataIndex: 'is_dollar',
    key: 'is_dollar',
  },
  {
    title: 'Anulada',
    dataIndex: 'is_override',
    key: 'is_override',
  },
  {
    title: 'Enviada DIAN',
    dataIndex: 'is_electronic_invoiced',
    key: 'is_electronic_invoiced',
  },
  {
    title: 'Metodos de pago',
    dataIndex: 'paid_by',
    key: 'paid_by',
  },
  {
    title: '',
    dataIndex: 'action',
    key: 'action',
  },
]
