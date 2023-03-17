import { useEffect, useState } from 'react'
import { axiosRequest } from '../../../api/api'
import { salesByShopURL } from '../../../utils/network'
import { ISaleByShopProps } from '../types/DashboardTypes'
import { Pie } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, ChartOptions, ChartData } from 'chart.js'
import { Spin } from 'antd'

ChartJS.register(ArcElement, Tooltip, Legend)

const SaleByShop = () => {
  const [salesByShopData, setSalesByShopData] = useState<ISaleByShopProps[]>()
  const [loading, setLoading] = useState(false)

  const getData = async () => {
    try {
      setLoading(true)
      const response = await axiosRequest<ISaleByShopProps[]>({
        url: salesByShopURL,
        hasAuth: true,
      })
      if (response) {
        const result = response.data.map((item) => ({
          ...item,
          color: generarColorPastel(),
        }))
        setSalesByShopData(result)
      }
    } catch (e) {
      console.log(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getData()
  }, [])

  const generarColorPastel = () => {
    // Generar valores aleatorios para los componentes RGB del color
    const r = Math.floor(Math.random() * 100 + 155)
    const g = Math.floor(Math.random() * 100 + 155)
    const b = Math.floor(Math.random() * 100 + 155)

    // Convertir los componentes RGB a hexadecimal
    const rgb = (r << 16) | (g << 8) | b
    const hex = '#' + rgb.toString(16)

    return hex
  }

  const getChartsData = (): ChartData<'pie', number[], unknown> => {
    return {
      labels: salesByShopData?.map((item) => item.name),
      datasets: [
        {
          label: 'Ventas',
          data: salesByShopData?.map((item) => item.amount_total) || [],
          backgroundColor: salesByShopData?.map((item) => item.color) || [],
          borderColor: salesByShopData?.map((item) => item.color) || [],
        },
      ],
    }
  }

  const pieOptions: ChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        labels: {
          font: {
            size: 12,
          },
        },
      },
    },
  }

  return (
    <div className='bg-white p-4 rounded-lg shadow-md'>
      <h3 className='m-0 font-bold'>Ventas por tienda</h3>
      <div className='h-full grid place-items-center'>
        {loading ? (
          <Spin />
        ) : (
          <Pie data={getChartsData()} options={pieOptions} updateMode='resize' />
        )}
      </div>
    </div>
  )
}

export default SaleByShop
