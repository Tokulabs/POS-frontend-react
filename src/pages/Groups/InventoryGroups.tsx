import { FC, useState } from 'react'
import ContentLayout from '../../layouts/ContentLayout/ContentLayout'
import { DataPropsForm } from '../../types/AuthTypes'
import AddGroupForm from './components/AddGroupForm'
import { useGetGroups } from './../../hooks/useGetGroups'
import { getGroups } from '../../hooks/helper/functions'

export interface IGroupsProps {
  id: number
  name: string
  belongs_to: {
    name: string
    id: number
  } | null
  created_at: string
  total_items: number
}

const Users: FC = () => {
  const [modalState, setModalState] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [groups, setGroups] = useState<IGroupsProps[]>([])

  useGetGroups(setGroups, setFetching)

  const onCreateGroup = () => {
    setModalState(false)
    getGroups(setGroups, setFetching)
  }

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Nombre',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Categoria Padre',
      dataIndex: 'belongsTo',
      key: 'belongsTo',
    },
    {
      title: 'Fecha de creación',
      dataIndex: 'created_at',
      key: 'created_at',
    },
    {
      title: 'Items Totales',
      dataIndex: 'total_items',
      key: 'total_items',
    },
    {
      title: '',
      dataIndex: 'action',
      key: 'action',
    },
  ]

  return (
    <>
      <ContentLayout
        pageTitle='Categorias'
        buttonTitle='+ Categoria'
        setModalState={setModalState}
        dataSource={groups as unknown as DataPropsForm[]}
        columns={columns}
        fetching={fetching}
      >
        <AddGroupForm
          onSuccessCallback={onCreateGroup}
          isVisible={modalState}
          onCancelCallback={() => setModalState(false)}
          groups={groups}
        />
      </ContentLayout>
    </>
  )
}

export default Users
