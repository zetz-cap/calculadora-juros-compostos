# Calculadora de Juros Compostos

Projeto estático em HTML, CSS e JavaScript, pronto para publicação no GitHub Pages.

## Estrutura

```text
calculadora-juros-compostos/
├── index.html
├── README.md
├── css/
│   └── style.css
└── js/
    └── script.js
```

## Recursos

- Valores em reais e formatação pt-BR.
- Aporte inicial e mensal.
- Prazo e rentabilidade anual.
- Aportes no início ou no fim do mês.
- Gráfico empilhado de capital e rendimentos.
- Seção dinâmica “E se eu...” com três cenários de aportes extras.
- Paleta em amarelos com textos escuros para contraste.

## Publicar no GitHub Pages

1. Envie todo o conteúdo desta pasta para a raiz do repositório.
2. Abra **Settings > Pages**.
3. Em **Build and deployment**, escolha **Deploy from a branch**.
4. Selecione a branch **main** e a pasta **/(root)**.
5. Clique em **Save**.


## Atualização v3

- Os valores de `DEFAULT_VALUES` agora são aplicados automaticamente ao abrir a página.
- CSS e JavaScript usam `?v=3` para evitar cache antigo no GitHub Pages.
- A seção “E se eu...” está no arquivo `index.html`, abaixo da calculadora.
