document.addEventListener('DOMContentLoaded', () => {
    // --- Elementos DOM ---
    const fileInput = document.getElementById('file-input');
    const fileNameDisplay = document.getElementById('file-name');
    const btnEscolher = document.getElementById('btn-escolher');
    const btnLimpar = document.getElementById('btn-limpar');
    const dropArea = document.getElementById('drop-area');
    const imagePreviewArea = document.getElementById('image-preview');
    const paletaCoresContainer = document.getElementById('paleta-cores');
    const statusMessage = document.getElementById('status-message');
    const colorCanvas = document.getElementById('color-canvas');
    const colorThief = new ColorThief();

    // --- Variáveis de Estado ---
    let currentImage = null;

    // --- Funções de Ajuda ---

    // Converte um array RGB [r, g, b] para código HEX
    function rgbToHex(rgb) {
        return "#" + ((1 << 24) + (rgb[0] << 16) + (rgb[1] << 8) + rgb[2]).toString(16).slice(1).toUpperCase();
    }

    // Limpa a interface
    function limparInterface() {
        imagePreviewArea.innerHTML = '<p>Nenhuma imagem selecionada.</p>';
        paletaCoresContainer.innerHTML = '';
        fileNameDisplay.value = '';
        statusMessage.textContent = '';
        currentImage = null;
    }

    // --- Funções de Upload ---

    // Abre o diálogo de seleção de arquivo
    btnEscolher.addEventListener('click', () => {
        fileInput.click();
    });

    // Limpa o estado quando o botão 'Limpar' é clicado
    btnLimpar.addEventListener('click', limparInterface);

    // Manipula a seleção do arquivo
    fileInput.addEventListener('change', (e) => {
        const files = e.target.files;
        if (files.length > 0) {
            processarArquivo(files[0]);
        }
    });

    // Manipula Arrastar e Soltar (Drag and Drop)
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    // Efeitos visuais de highlight
    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, () => dropArea.classList.add('highlight'), false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, () => dropArea.classList.remove('highlight'), false);
    });

    // Solta o arquivo
    dropArea.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length > 0) {
            processarArquivo(files[0]);
        }
    }

    // --- Processamento da Imagem ---

    function processarArquivo(file) {
        if (!file.type.startsWith('image/')) {
            alert('Por favor, selecione um arquivo de imagem.');
            return;
        }

        limparInterface();
        fileNameDisplay.value = file.name;
        
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => {
            const img = document.createElement('img');
            img.src = reader.result;
            
            // Renderiza a imagem no preview
            imagePreviewArea.innerHTML = '';
            imagePreviewArea.appendChild(img);

            currentImage = img;
            
            // Chama a extração de cores após a imagem carregar
            img.onload = () => {
                extrairPaleta(img);
            };
            img.onerror = () => {
                statusMessage.textContent = 'Erro ao carregar a imagem.';
            };
        };
    }

    function extrairPaleta(imgElement) {
        statusMessage.textContent = 'Extraindo paleta de cores...';
        paletaCoresContainer.innerHTML = '';

        try {
            // Usa o ColorThief para obter 5 cores dominantes
            // A biblioteca ColorThief deve estar incluída no HTML!
            const paletaRGB = colorThief.getPalette(imgElement, 5); 
            
            if (paletaRGB && paletaRGB.length > 0) {
                
                paletaRGB.forEach(rgbArray => {
                    const hexCode = rgbToHex(rgbArray);
                    criarCorItem(hexCode);
                });
                statusMessage.textContent = `Paleta de ${paletaRGB.length} cores extraída com sucesso. Clique para copiar o código.`;
            } else {
                statusMessage.textContent = 'Não foi possível extrair cores desta imagem.';
            }

        } catch (e) {
            statusMessage.textContent = 'Erro ao processar imagem. Tente uma imagem diferente.';
            console.error(e);
        }
    }

    // --- Criação da Paleta na Interface ---

    function criarCorItem(hexCode) {
        const corItem = document.createElement('div');
        corItem.className = 'cor-item';

        const corQuadrado = document.createElement('div');
        corQuadrado.className = 'cor-quadrado';
        corQuadrado.style.backgroundColor = hexCode;

        const corHex = document.createElement('div');
        corHex.className = 'cor-hex';
        corHex.textContent = hexCode;

        corItem.appendChild(corQuadrado);
        corItem.appendChild(corHex);
        
        // Adiciona funcionalidade de copiar ao clicar
        corItem.addEventListener('click', () => {
            navigator.clipboard.writeText(hexCode).then(() => {
                statusMessage.textContent = `Código ${hexCode} copiado!`;
            });
        });

        paletaCoresContainer.appendChild(corItem);
    }

});
