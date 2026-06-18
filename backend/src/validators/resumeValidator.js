/**
 * VALIDATOR - ResumeValidator
 * Responsável por validar os dados de entrada do currículo.
 * 
 * PROTEÇÃO XSS: a validação rejeita entradas malformadas antes
 * de qualquer processamento. O escape da saída é feito pelo frontend (React).
 */
const validate = (data) => {
    const errors = [];
    const { name, email, phone, website, experience } = data;

    if (!name || name.trim().length < 3 || name.trim().length > 100) {
        errors.push('Nome deve ter entre 3 e 100 caracteres.');
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        errors.push('Informe um endereço de e-mail válido.');
    }

    if (phone && phone.trim().length > 0) {
        if (!/^[\d\s()+\-.]{8,20}$/.test(phone.trim())) {
            errors.push('Informe um telefone válido (apenas números, espaços, hífens e parênteses).');
        }
    }

    if (website && website.trim().length > 0) {
        try {
            new URL(website.trim());
        } catch (_) {
            errors.push('Informe uma URL válida (ex: https://exemplo.com).');
        }
    }

    if (!experience || experience.trim().length < 10 || experience.trim().length > 3000) {
        errors.push('Experiência profissional deve ter entre 10 e 3000 caracteres.');
    }

    return errors;
};

module.exports = { validate };
