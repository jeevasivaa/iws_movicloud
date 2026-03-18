import GenericSectionPage from '../components/shared/GenericSectionPage'

function Settings() {
  return (
    <GenericSectionPage
      title="Settings"
      subtitle="Workspace controls, user roles, and platform-level configuration options."
      bullets={[
        'Role and permission matrix for client and internal users.',
        'Notification policies and automation defaults.',
        'Regional settings and compliance profile management.',
      ]}
    />
  )
}

export default Settings
