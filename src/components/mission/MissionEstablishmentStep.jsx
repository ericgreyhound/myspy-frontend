import MissionSelectStep from './MissionSelectStep.jsx';

export default function MissionEstablishmentStep(props) {
  const { theme, ...rest } = props;
  return (
    <MissionSelectStep
      {...rest}
      theme={theme}
      title="Qual o estabelecimento?"
      description="Escolha o estabelecimento que irá receber a missão."
      placeholder="Pesquisar estabelecimento"
      idleMessage="Digite para escolher o estabelecimento."
    />
  );
}
