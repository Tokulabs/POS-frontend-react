import { FC, useState } from 'react'
import ContentLayout from '../../layouts/ContentLayout/ContentLayout'
import { DataPropsForm } from '../../types/AuthTypes'
import AddGroupForm from './components/AddGroupForm'
import { useGetGroups } from './../../hooks/useGetGroups'
import { getGroups } from '../../hooks/helper/functions'
import { columns } from './data/columnData'
import { IGroupsProps } from './types/GroupTypes'

const Users: FC = () => {
  const [modalState, setModalState] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [groups, setGroups] = useState<IGroupsProps[]>([])

  useGetGroups(setGroups, setFetching)

  const onCreateGroup = () => {
    setModalState(false)
    getGroups(setGroups, setFetching)
  }

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
