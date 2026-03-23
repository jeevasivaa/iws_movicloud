import GenericSectionPage from '../components/shared/GenericSectionPage'

function Notifications() {
  return (
    <GenericSectionPage
      title="Notifications"
      subtitle="Operational alerts, escalation settings, and delivery preferences across teams."
      bullets={[
        'Critical incident alerts for production and logistics workflows.',
        'Digest schedules for managers, floor staff, and finance teams.',
        'Escalation paths for SLA breaches and delayed dispatches.',
      ]}
    />
  )
}

export default Notifications
