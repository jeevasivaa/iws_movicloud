import GenericSectionPage from '../components/shared/GenericSectionPage'

function Marketing() {
  return (
    <GenericSectionPage
      title="Marketing"
      subtitle="Campaign planning, demand-shaping programs, and channel-level promotion controls."
      bullets={[
        'Launch calendars for B2B and retail campaign windows.',
        'Channel mix performance and conversion trend summaries.',
        'Promo budget allocations with margin impact projections.',
      ]}
    />
  )
}

export default Marketing
