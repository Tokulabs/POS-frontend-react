const baseURL = import.meta.env.VITE_BASE_URL

export const loginURL = baseURL + 'user/login'
export const meURL = baseURL + 'user/me'
export const createUserURL = baseURL + 'user/create-user'
export const usersURL = baseURL + 'user/users'
export const updatePasswordURL = baseURL + 'user/update-password'
export const groupURL = baseURL + 'app/group'
export const inventoryURL = baseURL + 'app/inventory'
export const inventoryCSVURL = baseURL + 'app/inventory-csv'
export const shopURL = baseURL + 'app/shop'
export const activitiesURL = baseURL + 'user/activities'
export const invoiceURL = baseURL + 'app/invoice'
export const summaryURL = baseURL + 'app/summary'
export const topSellURL = baseURL + 'app/top-selling'

export const cloudinaryURL = 'https://api.cloudinary.com/v1_1/de4vbdzth/upload'
