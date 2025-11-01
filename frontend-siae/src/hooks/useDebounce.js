import { useState, useEffect } from 'react';

/**
 * Hook de Debounce.
 * Retrasa la actualización de un valor hasta que han pasado 'delay' milisegundos
 * desde la última vez que se modificó.
 * @param value El valor a "retrasar" (ej: el texto de un filtro)
 * @param delay El tiempo de espera en ms (ej: 500)
 * @returns El valor "retrasado"
 */
function useDebounce(value, delay) {
    // Estado para guardar el valor retrasado
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        // Inicia un temporizador
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        // Limpia el temporizador si el 'value' cambia (ej: el usuario sigue escribiendo)
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]); // Solo se re-ejecuta si el valor o el delay cambian

    return debouncedValue;
}

export default useDebounce;