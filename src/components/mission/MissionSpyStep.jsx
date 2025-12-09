import MissionSelectStep from './MissionSelectStep.jsx';

export default function MissionSpyStep({ theme, ticketValue, establishment, actionLoading = false, ...rest }) {
  return (
    <MissionSelectStep
      {...rest}
      theme={theme}
      title="Qual o espião?"
      description="Selecione o utilizador responsável por executar a missão."
      placeholder="Pesquisar espião"
      actionLabel="Criar missão"
      actionLoading={actionLoading}
      idleMessage="Digite para escolher o espião."
    >
      <div
        className="px-4 py-3 rounded-xl text-sm space-y-1"
        style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}
      >
        <p>
          <strong>Ticket:</strong> {ticketValue ? `€ ${Number(ticketValue).toFixed(2)}` : '—'}
        </p>
        <p>
          <strong>Estabelecimento:</strong> {establishment?.fullName || '—'}
        </p>
      </div>
    </MissionSelectStep>
  );
}
