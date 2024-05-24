// src/data.ts

export interface HourlySalesData {
  time: string
  totalProductsSold: number
}

export interface SalesData {
  time: string
  totalMoneySold: number
}

export const hourlyData: HourlySalesData[] = [
  { time: '01:00', totalProductsSold: 10 },
  { time: '02:00', totalProductsSold: 5 },
  { time: '03:00', totalProductsSold: 15 },
  { time: '04:00', totalProductsSold: 20 },
  { time: '05:00', totalProductsSold: 25 },
  { time: '06:00', totalProductsSold: 30 },
  { time: '07:00', totalProductsSold: 35 },
  { time: '08:00', totalProductsSold: 30 },
  { time: '09:00', totalProductsSold: 45 },
  { time: '10:00', totalProductsSold: 50 },
  { time: '11:00', totalProductsSold: 55 },
  { time: '12:00', totalProductsSold: 10 },
  { time: '13:00', totalProductsSold: 65 },
  { time: '14:00', totalProductsSold: 78 },
  { time: '15:00', totalProductsSold: 75 },
  { time: '16:00', totalProductsSold: 80 },
  { time: '17:00', totalProductsSold: 4 },
  { time: '18:00', totalProductsSold: 90 },
  { time: '19:00', totalProductsSold: 95 },
  { time: '20:00', totalProductsSold: 50 },
  { time: '21:00', totalProductsSold: 105 },
  { time: '22:00', totalProductsSold: 110 },
  { time: '23:00', totalProductsSold: 115 },
  { time: '00:00', totalProductsSold: 120 },
]

export const dailyData: SalesData[] = [
  { time: 'Monday', totalMoneySold: 2000 },
  { time: 'Tuesday', totalMoneySold: 3000 },
  { time: 'Wednesday', totalMoneySold: 2500 },
  { time: 'Thursday', totalMoneySold: 3500 },
  { time: 'Friday', totalMoneySold: 4000 },
  { time: 'Saturday', totalMoneySold: 4500 },
  { time: 'Sunday', totalMoneySold: 1500 },
]

export const weeklyData: SalesData[] = [
  { time: 'Week 1', totalMoneySold: 12000 },
  { time: 'Week 2', totalMoneySold: 15000 },
  { time: 'Week 3', totalMoneySold: 13000 },
  { time: 'Week 4', totalMoneySold: 18000 },
]

export const monthlyData: SalesData[] = [
  { time: 'January', totalMoneySold: 50000 },
  { time: 'February', totalMoneySold: 60000 },
  { time: 'March', totalMoneySold: 70000 },
  { time: 'April', totalMoneySold: 80000 },
  { time: 'May', totalMoneySold: 90000 },
  { time: 'June', totalMoneySold: 100000 },
  { time: 'July', totalMoneySold: 110000 },
  { time: 'August', totalMoneySold: 120000 },
  { time: 'September', totalMoneySold: 130000 },
  { time: 'October', totalMoneySold: 140000 },
  { time: 'November', totalMoneySold: 150000 },
  { time: 'December', totalMoneySold: 160000 },
]
