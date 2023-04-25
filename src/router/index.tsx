import { BrowserRouter, Route, Routes } from 'react-router-dom'

import { FC } from 'react'

import Login from '../pages/Auth/Login'
import CheckUser from '../pages/Auth/CheckUser'
import Home from './../pages/Home/Home'
import { AuthRoutes } from './../components/Auth/AuthRoutes'
import Users from '../pages/Users/Users'
import UpdateUserPassword from '../pages/Auth/UpdateUserPassword'
import InventoryGroup from '../pages/Groups/InventoryGroups'
import Inventory from '../pages/Inventories/Inventories'
import Shops from '../pages/Shops/Shops'
import UserActivities from './../pages/UserActivities/UserActivities'
import Purchase from '../pages/Purchase/Purchase'
import Invoices from './../pages/Invoices/Invoices'
import Notfound from '../pages/NotFound/404Notfound'
import Dian from '../pages/Dian/Dian'

export const Router: FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route path='/check-user' element={<CheckUser />} />
        <Route path='/create-password' element={<UpdateUserPassword />} />
        <Route
          path='*'
          element={
            <AuthRoutes>
              <Routes>
                <Route path='/' element={<Home />} />
                <Route path='/users' element={<Users />} />
                <Route path='/inventory-groups' element={<InventoryGroup />} />
                <Route path='/inventories' element={<Inventory />} />
                <Route path='/shops' element={<Shops />} />
                <Route path='/user-activities' element={<UserActivities />} />
                <Route path='/purchase' element={<Purchase />} />
                <Route path='/invoices' element={<Invoices />} />
                <Route path='/dian-resolution' element={<Dian />} />
                <Route path='*' element={<Notfound />} />
              </Routes>
            </AuthRoutes>
          }
        ></Route>
      </Routes>
    </BrowserRouter>
  )
}

export default Router
