export type Language = 'en' | 'pt' | 'es';

export const translations = {
  en: {
    // Login
    loginTitle: "Access Control",
    loginSubtitle: "Please authenticate to continue",
    email: "Email",
    password: "Password",
    loginButton: "Login System",
    loginFooter: "Restricted Access • Authorized Personnel Only",
    invalidCredentials: "Invalid email or password",
    
    // App Header
    subtitle: "Smart Purchasing Tool (Proxy Automator)",
    logout: "Logout",
    
    // Main Card
    targetPattern: "Target Pattern",
    duration: "Duration",
    days: "days",
    tag: "Tag",
    none: "None",
    walletBalance: "Wallet Balance",
    executePurchase: "EXECUTE PURCHASE",
    processing: "Processing...",
    
    // Result Area
    purchasedProxy: "Purchased Proxy",
    copy: "Copy",
    copied: "Copied",
    formatInfo: "Format: IP:PORT:LOGIN:PASSWORD",
    setupRequired: "Setup required: Please configure your API Key in settings.",
    
    // Settings
    language: "Language",
    configuration: "Configuration",
    close: "Close",
    apiKey: "API Key",
    apiKeyNote: "Your key is stored locally in your browser.",
    purchasePattern: "Purchase Pattern",
    proxyVersion: "Proxy Version",
    protocol: "Protocol",
    country: "Country",
    quantity: "Quantity",
    period: "Period (Days)",
    descriptionTag: "Description Tag",
    autoProlong: "Auto-prolong enabled",
    corsNote: "If requests fail, try enabling the CORS proxy. This routes requests through a public proxy to bypass browser restrictions.",
    useCors: "Use CORS Proxy",
    saveConfig: "Save Configuration",
    
    // Logs
    systemLogs: "System Logs",
    noActivity: "No activity recorded",
    
    // Dynamic Log Messages
    configSaved: "Configuration saved.",
    balanceUpdated: "Balance updated: {balance}",
    balanceFailed: "Balance Check Failed: {error}",
    networkError: "Network error detected. Auto-enabling CORS proxy...",
    proxyCopied: "Proxy copied to clipboard",
    copyFailed: "Failed to copy to clipboard",
    missingKey: "API Key is missing. Please check settings.",
    smartSeqStart: "Starting smart acquisition sequence...",
    checkInventory: "Checking inventory for reusable proxies...",
    reuseProxy: "Reusing proxy {host}:{port} ({usage}/3)",
    lowBalance: "Low balance! Need ~{cost}, have {balance}. Attempting purchase anyway...",
    buyingProxies: "Buying {count} new prox{suffix}...",
    boughtSuccess: "Bought {count} new proxies. Order #{id}",
    purchaseFailed: "Purchase failed: {error}",
    acquiredCount: "Acquired {count} proxies.",
    noProxies: "No proxies acquired.",
    processFailed: "Process failed",
    checkInternet: "Check internet or enable CORS proxy in settings.",
    cautionPrice: "Could not fetch current pricing. Proceeding with caution.",
    manualCORS: "Network error. Try enabling CORS Proxy in settings.",
    autoCopied: "Proxy copied to clipboard automatically"
  },
  pt: {
    // Login
    loginTitle: "Controle de Acesso",
    loginSubtitle: "Autentique-se para continuar",
    email: "E-mail",
    password: "Senha",
    loginButton: "Entrar no Sistema",
    loginFooter: "Acesso Restrito • Apenas Pessoal Autorizado",
    invalidCredentials: "E-mail ou senha inválidos",
    
    // App Header
    subtitle: "Ferramenta de Compra Inteligente (Automação)",
    logout: "Sair",
    
    // Main Card
    targetPattern: "Padrão Alvo",
    duration: "Duração",
    days: "dias",
    tag: "Tag",
    none: "Nenhum",
    walletBalance: "Saldo",
    executePurchase: "EXECUTAR COMPRA",
    processing: "Processando...",
    
    // Result Area
    purchasedProxy: "Proxy Comprado",
    copy: "Copiar",
    copied: "Copiado",
    formatInfo: "Formato: IP:PORTA:LOGIN:SENHA",
    setupRequired: "Configuração necessária: Configure sua Chave de API.",
    
    // Settings
    language: "Idioma",
    configuration: "Configuração",
    close: "Fechar",
    apiKey: "Chave da API",
    apiKeyNote: "Sua chave é armazenada localmente no seu navegador.",
    purchasePattern: "Padrão de Compra",
    proxyVersion: "Versão do Proxy",
    protocol: "Protocolo",
    country: "País",
    quantity: "Quantidade",
    period: "Período (Dias)",
    descriptionTag: "Tag de Descrição",
    autoProlong: "Renovação automática ativada",
    corsNote: "Se as solicitações falharem, ative o proxy CORS. Isso roteia solicitações por um proxy público para contornar restrições.",
    useCors: "Usar Proxy CORS",
    saveConfig: "Salvar Configuração",
    
    // Logs
    systemLogs: "Logs do Sistema",
    noActivity: "Nenhuma atividade registrada",

    // Dynamic Logs
    configSaved: "Configuração salva.",
    balanceUpdated: "Saldo atualizado: {balance}",
    balanceFailed: "Verificação de saldo falhou: {error}",
    networkError: "Erro de rede detectado. Ativando proxy CORS automaticamente...",
    proxyCopied: "Proxy copiado para a área de transferência",
    copyFailed: "Falha ao copiar para a área de transferência",
    missingKey: "Chave da API ausente. Verifique as configurações.",
    smartSeqStart: "Iniciando sequência de aquisição inteligente...",
    checkInventory: "Verificando inventário para proxies reutilizáveis...",
    reuseProxy: "Reutilizando proxy {host}:{port} ({usage}/3)",
    lowBalance: "Saldo baixo! Necessário ~{cost}, disponível {balance}. Tentando comprar...",
    buyingProxies: "Comprando {count} novo(s) proxy(ies)...",
    boughtSuccess: "Comprou {count} novos proxies. Pedido #{id}",
    purchaseFailed: "Compra falhou: {error}",
    acquiredCount: "Adquiriu {count} proxies.",
    noProxies: "Nenhum proxy adquirido.",
    processFailed: "Processo falhou",
    checkInternet: "Verifique a internet ou ative o proxy CORS.",
    cautionPrice: "Não foi possível obter preço atual. Prosseguindo com cautela.",
    manualCORS: "Erro de rede. Tente ativar o Proxy CORS nas configurações.",
    autoCopied: "Proxy copiado automaticamente"
  },
  es: {
    // Login
    loginTitle: "Control de Acceso",
    loginSubtitle: "Por favor autentíquese para continuar",
    email: "Correo",
    password: "Contraseña",
    loginButton: "Ingresar al Sistema",
    loginFooter: "Acceso Restringido • Solo Personal Autorizado",
    invalidCredentials: "Correo o contraseña inválidos",
    
    // App Header
    subtitle: "Herramienta de Compra Inteligente (Automatización)",
    logout: "Cerrar Sesión",
    
    // Main Card
    targetPattern: "Patrón Objetivo",
    duration: "Duración",
    days: "días",
    tag: "Etiqueta",
    none: "Ninguno",
    walletBalance: "Saldo",
    executePurchase: "EJECUTAR COMPRA",
    processing: "Procesando...",
    
    // Result Area
    purchasedProxy: "Proxy Comprado",
    copy: "Copiar",
    copied: "Copiado",
    formatInfo: "Formato: IP:PUERTO:USUARIO:CONTRASEÑA",
    setupRequired: "Configuración requerida: Configure su Clave API.",
    
    // Settings
    language: "Idioma",
    configuration: "Configuración",
    close: "Cerrar",
    apiKey: "Clave API",
    apiKeyNote: "Su clave se almacena localmente en su navegador.",
    purchasePattern: "Patrón de Compra",
    proxyVersion: "Versión de Proxy",
    protocol: "Protocolo",
    country: "País",
    quantity: "Cantidad",
    period: "Período (Días)",
    descriptionTag: "Etiqueta de Descripción",
    autoProlong: "Renovación automática activada",
    corsNote: "Si fallan las solicitudes, active el proxy CORS. Esto enruta las solicitudes a través de un proxy público para evitar restricciones.",
    useCors: "Usar Proxy CORS",
    saveConfig: "Guardar Configuración",
    
    // Logs
    systemLogs: "Registros del Sistema",
    noActivity: "Sin actividad registrada",

    // Dynamic Logs
    configSaved: "Configuración guardada.",
    balanceUpdated: "Saldo actualizado: {balance}",
    balanceFailed: "Fallo en verificación de saldo: {error}",
    networkError: "Error de red detectado. Activando proxy CORS...",
    proxyCopied: "Proxy copiado al portapapeles",
    copyFailed: "Fallo al copiar al portapapeles",
    missingKey: "Falta Clave API. Verifique configuraciones.",
    smartSeqStart: "Iniciando secuencia de adquisición inteligente...",
    checkInventory: "Verificando inventario para proxies reutilizables...",
    reuseProxy: "Reutilizando proxy {host}:{port} ({usage}/3)",
    lowBalance: "¡Saldo bajo! Necesita ~{cost}, tiene {balance}. Intentando comprar...",
    buyingProxies: "Comprando {count} nuevos proxies...",
    boughtSuccess: "Comprados {count} nuevos proxies. Pedido #{id}",
    purchaseFailed: "Compra fallida: {error}",
    acquiredCount: "Adquiridos {count} proxies.",
    noProxies: "No se adquirieron proxies.",
    processFailed: "Proceso fallido",
    checkInternet: "Verifique internet o active proxy CORS.",
    cautionPrice: "No se pudo obtener precio actual. Procediendo con precaución.",
    manualCORS: "Error de red. Intente habilitar Proxy CORS en la configuración.",
    autoCopied: "Proxy copiado automáticamente"
  }
};