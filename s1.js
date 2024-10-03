// Error detection functions
function calculateCRC(data, generator) {
    const generatorLength = generator.length;
    let dividend = data + '0'.repeat(generatorLength - 1);
    
    for (let i = 0; i <= dividend.length - generatorLength; ) {
        if (dividend[i] === '1') {
            dividend = dividend.substring(0, i) + 
            dividend.substring(i, i + generatorLength)
                .split('')
                .map((bit, index) => bit === generator[index] ? '0' : '1')
                .join('') + 
            dividend.substring(i + generatorLength);
        }
        i++;
    }
    return dividend.slice(-(generatorLength - 1));
}

function calculateChecksum(data) {
    let checksum = 0;
    for (let i = 0; i < data.length; i += 8) {
        const byte = data.substring(i, i + 8);
        checksum += parseInt(byte, 2);
    }
    checksum = checksum % 256; // Ensure 8-bit result
    return checksum.toString(2).padStart(8, '0');
}

function calculateParity(data) {
    const count = (data.match(/1/g) || []).length;
    return count % 2 === 0 ? '0' : '1';
}

function calculateHamming(data) {
    if (data.length !== 4) {
        throw new Error('Hamming code requires 4 bits of data');
    }
    const p1 = parseInt(data[0]) ^ parseInt(data[1]) ^ parseInt(data[3]);
    const p2 = parseInt(data[0]) ^ parseInt(data[2]) ^ parseInt(data[3]);
    const p3 = parseInt(data[1]) ^ parseInt(data[2]) ^ parseInt(data[3]);
    return `${p1}${p2}${data[0]}${p3}${data[1]}${data[2]}${data[3]}`;
}

function calculateLuhn(data) {
    let sum = 0;
    let isEven = false;
    for (let i = data.length - 1; i >= 0; i--) {
        let digit = parseInt(data[i], 10);
        if (isEven) {
            digit *= 2;
            if (digit > 9) digit -= 9;
        }
        sum += digit;
        isEven = !isEven;
    }
    return sum % 10 === 0 ? 'Valid' : 'Invalid';
}

// UI interaction
const form = document.getElementById('calculator-form');
const methodSelect = document.getElementById('method');
const generatorGroup = document.getElementById('generator-group');
const resultDiv = document.getElementById('result');
const errorDiv = document.getElementById('error');
const calculateBtn = document.getElementById('calculate-btn');
const buttonText = document.getElementById('button-text');
const buttonSpinner = document.getElementById('button-spinner');

methodSelect.addEventListener('change', () => {
    generatorGroup.style.display = methodSelect.value === 'crc' ? 'block' : 'none';
});

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = document.getElementById('data').value;
    const method = methodSelect.value;
    const generator = document.getElementById('generator').value;

    resultDiv.classList.remove('show');
    errorDiv.classList.remove('show');
    calculateBtn.disabled = true;
    buttonText.classList.add('hidden');
    buttonSpinner.classList.remove('hidden');

    try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        let result;
        switch (method) {
            case 'crc':
                if (!generator) throw new Error('Please enter a valid generator for CRC.');
                result = calculateCRC(data, generator);
                break;
            case 'checksum':
                result = calculateChecksum(data);
                break;
            case 'parity':
                result = calculateParity(data);
                break;
            case 'hamming':
                result = calculateHamming(data);
                break;
            case 'luhn':
                result = calculateLuhn(data);
                break;
        }

        const methodIcon = getMethodIcon(method);
        resultDiv.innerHTML = `${methodIcon} Result: ${result}`;
        resultDiv.classList.remove('hidden');
        resultDiv.classList.add('show');
    } catch (error) {
        errorDiv.textContent = error.message;
        errorDiv.classList.remove('hidden');
        errorDiv.classList.add('show');
    } finally {
        calculateBtn.disabled = false;
        buttonText.classList.remove('hidden');
        buttonSpinner.classList.add('hidden');
    }
});

function getMethodIcon(method) {
    const iconMap = {
        crc: '🔄',
        checksum: '🧮',
        parity: '⚖️',
        hamming: '🔨',
        luhn: '💳'
    };
    return iconMap[method] || '🛡️';
}

// Background animation
const backgroundAnimation = document.getElementById('background-animation');

function createParticle() {
    const particle = document.createElement('div');
    particle.classList.add('particle');
    
    const size = Math.random() * 5 + 2;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    
    const x = Math.random() * window.innerWidth;
    const y = Math.random() * window.innerHeight;
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    
    const hue = Math.random() * 60 + 200; // Blue to purple range
    particle.style.backgroundColor = `hsl(${hue}, 70%, 60%)`;
    
    backgroundAnimation.appendChild(particle);
    
    setTimeout(() => {
        const keyframes = [
            { transform: `translate(0, 0)`, opacity: 1 },
            { transform: `translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px)`, opacity: 0 }
        ];
        const options = {
            duration: Math.random() * 3000 + 2000,
            easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
            fill: 'forwards'
        };
        particle.animate(keyframes, options).onfinish = () => {
            particle.remove();
            createParticle();
        };
    }, 0);
}

for (let i = 0; i < 50; i++) {
    createParticle();
}

// Initialize the generator input visibility
methodSelect.dispatchEvent(new Event('change'));
