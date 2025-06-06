const baseURL = import.meta.env.VITE_BASE_URL

// Auth
export const loginURL = baseURL + 'user/login'
export const forceUpdatePasswordURL = baseURL + 'user/update-password-required'
export const passwordRecoveryURL = baseURL + 'user/mail-password-reset'
export const passswordResetURL = baseURL + 'user/password-reset'
export const requestVerificationEmailURL = baseURL + 'user/verify_email'
export const confirmEmailCode = baseURL + 'user/verify_email_confirm'
export const meURL = baseURL + 'user/me'
// User
export const createUserURL = baseURL + 'user/create-user'
export const usersURL = baseURL + 'user/users'
export const updatePasswordURL = baseURL + 'user/update-password'
// Groups
export const groupURL = baseURL + 'app/group'
// Inventory
export const inventoryURL = baseURL + 'app/inventory'
export const inventoryCSVURL = baseURL + 'app/inventory-csv'
// Inventory Movements
export const inventoryMovementsURL = baseURL + 'app/inventory-movement'
export const inventoryMovementsSimpleURL = baseURL + 'app/inventory-movement-simple-list'
// Activities
export const activitiesURL = baseURL + 'user/activities'
export const invoiceMinimalURL = baseURL + 'app/invoice-simple-list'
export const invoiceURL = baseURL + 'app/invoice'
export const invoiceByCodeURL = baseURL + 'app/invoice-painter'
export const invoiceUpdatePaymentMethodsURL = baseURL + 'app/update-payment-methods'
export const summaryURL = baseURL + 'app/summary'
export const topSellURL = baseURL + 'app/top-selling'
export const paymentTerminalsURL = baseURL + 'app/payment-terminal'
export const providersURL = baseURL + 'app/provider'
export const customerURL = baseURL + 'app/customer'
export const purchaseSummaryURL = baseURL + 'app/purchase-summary'
export const dianResolutionURL = baseURL + 'app/dian-resolution'
export const overrideInvoiceURL = baseURL + 'app/update-invoice'
export const summaryByHour = baseURL + 'app/hourly-quantities'
export const summaryByKeyframe = baseURL + 'app/sales-by-timeframe'
export const salesByUser = baseURL + 'app/sales-by-user'
export const downloadReportURL = baseURL + 'app/'
export const goalsURL = baseURL + 'app/goals'
export const uploadImageAWSURL = baseURL + 'app/upload-photo/'
export const citiesURL = baseURL + 'user/city'
export const eInvoiceDianURL = baseURL + 'dian/send_invoice/'
