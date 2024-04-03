export const columns = [
  {
    title: '# Factura',
    dataIndex: 'invoice_number',
    key: 'invoice_number',
  },
  {
    title: 'Creado Por',
    dataIndex: 'created_by_name',
    key: 'created_by_name',
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
    title: 'Pago en dolares',
    dataIndex: 'is_dollar',
    key: 'is_dollar',
  },
  {
    title: 'Anulada',
    dataIndex: 'is_override',
    key: 'is_override',
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
