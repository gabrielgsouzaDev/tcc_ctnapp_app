# **App Name**: CTNAPP

## Core Features:

- Autenticação de Aluno: Autenticação segura para alunos usando Firebase Authentication.
- Autenticação de Responsável: Autenticação segura para responsáveis usando Firebase Authentication.
- Seleção de Cantina: Permite que os alunos selecionem a cantina da sua escola para visualizar os produtos disponíveis.
- Sincronização de Pedidos em Tempo Real: Sincroniza os pedidos com o Firestore para refletir contagens precisas tanto no lado do consumidor quanto no lado do operador da cantina. A sincronização de dados com o MySQL ocorre através do api.php.
- Pedido de Produtos: Os alunos podem navegar pelo menu e fazer pedidos.
- Recarga de Saldo: Os responsáveis podem recarregar remotamente os saldos dos alunos. O saldo é armazenado no banco MySQL, enquanto o Firebase reflete essas atualizações em tempo real no app. O Firestore atua apenas como espelho temporário dos dados essenciais do MySQL, garantindo performance e atualização em tempo real no aplicativo mobile. As atualizações ocorrem via api.php. O responsável só terá acesso ao histórico/saldo do aluno que ele está vinculado, para deixar claro.
- Histórico de Pedidos: Permite que alunos e responsáveis visualizem o histórico de pedidos passados. O responsável só terá acesso ao histórico do aluno ao qual está vinculado.

## Style Guidelines:

- Cor primária: Laranja aeroespacial (#FC5407), evocando energia e apetite.
- Cor de fundo: Rosa champagne (#FFE7D4), oferecendo um pano de fundo leve e convidativo.
- Cor de destaque: Marrom arenoso (#FBAF72), destacando ações importantes.
- Fonte do corpo e título: 'Inter', uma fonte sans-serif conhecida por sua legibilidade e estética moderna.
- Use ícones claros e modernos para facilitar a navegação.
- Layout limpo e intuitivo otimizado para telas móveis.
- Transições sutis para uma experiência de usuário suave.