// src/hooks/useAnalisadorRoleta.js
import { useReducer, useEffect, useCallback, useRef } from 'react';

// --- CONSTANTES ---
const ROULETTE_WHEEL = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];
const redNumbers = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);
const ESTRATEGIAS = ['CRESCENTE', 'DECRESCENTE', 'OCULTO', 'ALTERNÂNCIA', 'CAVALOS 2/5/8', 'CAVALOS 1/4/7', 'CAVALOS 3/6/9'];

export const getNumberColor = (num) => (num === 0) ? 'green' : (redNumbers.has(num) ? 'red' : 'black');

const initialPlacarStats = ESTRATEGIAS.reduce((acc, nome) => {
    acc[nome] = { nome, status: 'validando', entradaOtimizada: 1, '1': 0, '2': 0, '3': 0, loss: 0 };
    return acc;
}, {});

const initialState = {
    jogadas: [],
    activePlay: null,
    placarStats: initialPlacarStats,
    sugestoes: null,
    history: [],
};

function reducer(state, action) {
    switch (action.type) {
        case 'ADD_JOGADA':
            return {
                ...state,
                history: [...state.history, { 
                    placarStats: state.placarStats, 
                    activePlay: state.activePlay, 
                    sugestoes: state.sugestoes 
                }],
                jogadas: [action.payload, ...state.jogadas],
            };
        case 'REMOVE_LAST':
            const lastState = state.history[state.history.length - 1];
            return {
                ...state,
                jogadas: state.jogadas.slice(1),
                placarStats: lastState ? lastState.placarStats : initialPlacarStats,
                activePlay: lastState ? lastState.activePlay : null,
                sugestoes: lastState ? lastState.sugestoes : null,
                history: state.history.slice(0, -1),
            };
        case 'UPDATE_ANALYTICS':
            return { ...state, ...action.payload };
        case 'RESET_ALL':
            return initialState;
        default:
            throw new Error('Ação do reducer não reconhecida.');
    }
}

export const useAnalisadorRoleta = () => {
    const [state, dispatch] = useReducer(reducer, initialState);
    const { jogadas, activePlay, placarStats, sugestoes, history } = state;
    const prevJogadasLength = useRef(jogadas.length);

    useEffect(() => {
        // >>> A CORREÇÃO DEFINITIVA ESTÁ AQUI <<<
        // O efeito só vai rodar a lógica de análise se um número foi ADICIONADO.
        // Se foi removido ou resetado, a restauração do reducer já é suficiente.
        if (jogadas.length <= prevJogadasLength.current) {
            prevJogadasLength.current = jogadas.length;
            return;
        }
        prevJogadasLength.current = jogadas.length;
        
        // --- Início da Lógica de Análise ---
        let currentPlay = activePlay;
        let newPlacarStats = JSON.parse(JSON.stringify(placarStats));
        
        if (currentPlay && currentPlay.lastResult) { currentPlay = null; }

        if (currentPlay) {
            currentPlay.spinsSinceTrigger++;
            const lastNum = jogadas[0];
            const success = new Set(currentPlay.numbers).has(lastNum);
            const basePatternName = currentPlay.basePatternName;

            if (!currentPlay.isLive && currentPlay.spinsSinceTrigger >= currentPlay.entryAttempt) { currentPlay.isLive = true; }
            
            if (currentPlay.isValidation) {
                if (success || currentPlay.spinsSinceTrigger >= 3) {
                    if (success) {
                        newPlacarStats[basePatternName].status = 'ativo';
                        newPlacarStats[basePatternName].entradaOtimizada = currentPlay.spinsSinceTrigger;
                    }
                    currentPlay = null;
                }
            } else if (currentPlay.isLive) {
                currentPlay.attempts++;
                if (success) {
                    const newEntrada = currentPlay.spinsSinceTrigger < newPlacarStats[basePatternName].entradaOtimizada ? currentPlay.spinsSinceTrigger : newPlacarStats[basePatternName].entradaOtimizada;
                    newPlacarStats[basePatternName][currentPlay.attempts]++;
                    newPlacarStats[basePatternName].entradaOtimizada = newEntrada;
                    currentPlay.lastResult = { type: 'sucesso', title: `✅ SUCESSO! ✅`, message: `<p>Aposta em <strong>${currentPlay.title}</strong> teve êxito na ${currentPlay.attempts}ª tentativa.</p>` };
                } else if (currentPlay.attempts >= 3) {
                    newPlacarStats[basePatternName].loss++;
                    newPlacarStats[basePatternName].status = 'validando';
                    currentPlay.lastResult = { type: 'fracasso', title: `❌ LOSS ❌`, message: `<p>Aposta em <strong>${currentPlay.title}</strong> falhou.</p>` };
                }
            } else if (success) {
                newPlacarStats[basePatternName].status = 'ativo';
                newPlacarStats[basePatternName]['1']++;
                newPlacarStats[basePatternName].entradaOtimizada = currentPlay.spinsSinceTrigger;
                currentPlay.lastResult = { type: 'sucesso', title: `✅ SUCESSO ANTECIPADO! ✅`, message: `<p>Padrão <strong>${currentPlay.title}</strong> teve êxito antes da entrada otimizada.</p>` };
            }
        } else {
             if (jogadas.length >= 2) {
                let patternFound = null, targetTerminal = -1, basePatternName = '';
                const lastTerminal = jogadas[0] % 10, secondLastTerminal = jogadas[1] % 10;
                if (lastTerminal < 7 && secondLastTerminal < 7) {
                    if (lastTerminal === (secondLastTerminal + 1) % 10) patternFound = 'CRESCENTE';
                    else if (lastTerminal === (secondLastTerminal - 1 + 10) % 10) patternFound = 'DECRESCENTE';
                    else if (lastTerminal === (secondLastTerminal + 2) % 10 || lastTerminal === (secondLastTerminal - 2 + 10) % 10) patternFound = 'OCULTO';
                }
                if (!patternFound) {
                    const cavaloSets = [{ name: '2/5/8', anchor: 8, targets: new Set([2, 5]) }, { name: '1/4/7', anchor: 7, targets: new Set([1, 4]) }, { name: '3/6/9', anchor: 9, targets: new Set([3, 6]) }];
                    for (const cavalo of cavaloSets) {
                        let foundAnchor = -1, foundTarget = -1;
                        if (lastTerminal === cavalo.anchor && cavalo.targets.has(secondLastTerminal)) { foundAnchor = lastTerminal; foundTarget = secondLastTerminal; }
                        else if (secondLastTerminal === cavalo.anchor && cavalo.targets.has(lastTerminal)) { foundAnchor = secondLastTerminal; foundTarget = lastTerminal; }
                        if (foundAnchor !== -1) {
                            patternFound = `CAVALOS ${cavalo.name}`;
                            for (const term of cavalo.targets) if (term !== foundTarget) { targetTerminal = term; break; }
                            break;
                        }
                    }
                }
                if (!patternFound && jogadas.length >= 3) {
                    const T3 = jogadas[0] % 10, T2 = jogadas[1] % 10, T1 = jogadas[2] % 10;
                    if (T1 < 7 && T2 < 7 && T3 < 7) {
                        if ((T1 !== T2 && T2 === T3) || (T1 === T3 && T1 !== T2) || (T1 === T2 && T2 !== T3)) {
                            patternFound = 'ALTERNÂNCIA';
                            if (T1 !== T2 && T2 === T3) targetTerminal = T1;
                            else if (T1 === T3 && T1 !== T2) targetTerminal = T2;
                            else targetTerminal = T3;
                        }
                    }
                }
    
                if (patternFound) {
                   if (targetTerminal === -1) {
                       if (patternFound === 'CRESCENTE') targetTerminal = (lastTerminal + 1) % 10;
                       else if (patternFound === 'DECRESCENTE') targetTerminal = (lastTerminal - 1 + 10) % 10;
                       else if (patternFound === 'OCULTO') targetTerminal = (lastTerminal === (secondLastTerminal + 2) % 10) ? (secondLastTerminal + 1) % 10 : (secondLastTerminal - 1 + 10) % 10;
                   }
                   basePatternName = patternFound.startsWith('CAVALOS') ? `CAVALOS ${patternFound.split(' ')[1]}` : patternFound;
                   
                   if (!([7, 8, 9].includes(targetTerminal) && !basePatternName.startsWith('CAVALOS'))) {
                       const strategyData = newPlacarStats[basePatternName];
                       if (strategyData) {
                           const getNeighbors = (number, distance = 2) => { const n = new Set(); const i = ROULETTE_WHEEL.indexOf(number); if (i === -1) return n; for (let j = 1; j <= distance; j++) { n.add(ROULETTE_WHEEL[(i - j + 37) % 37]); n.add(ROULETTE_WHEEL[(i + j) % 37]); } return n; };
                           const terminalNumbers = ROULETTE_WHEEL.filter(n => n % 10 === targetTerminal);
                           const suggestedNumbers = new Set(terminalNumbers);
                           terminalNumbers.forEach(num => getNeighbors(num).forEach(n => suggestedNumbers.add(n)));
                           if (targetTerminal === 0) suggestedNumbers.add(16);
                           
                           currentPlay = { numbers: [...suggestedNumbers], spinsSinceTrigger: 0, attempts: 0, isLive: false, title: `${basePatternName}: Terminal ${targetTerminal}`, targetTerminal: targetTerminal, basePatternName: basePatternName, isValidation: strategyData.status === 'validando', entryAttempt: strategyData.entradaOtimizada };
                       }
                   }
                }
            }
        }
        
        let newSugestao = null;
        if (currentPlay) {
            if (currentPlay.lastResult) {
                newSugestao = currentPlay.lastResult;
            } else if (currentPlay.isValidation) {
                newSugestao = null; 
            } else {
                if (currentPlay.spinsSinceTrigger >= currentPlay.entryAttempt - 1) {
                    newSugestao = { type: 'sugestao', title: `Sugestão: ${currentPlay.title}`, message: `<p>Esta é a <strong>${currentPlay.attempts + 1}ª</strong> tentativa.</p>`, targetTerminal: currentPlay.targetTerminal };
                } else {
                    const spinsToWait = currentPlay.entryAttempt - currentPlay.spinsSinceTrigger - 1;
                    newSugestao = { type: 'info', title: `Padrão Identificado: ${currentPlay.basePatternName}`, message: `<p>Aguardando entrada (faltam ${spinsToWait} rodada(s))...</p>` };
                }
            }
        }
        
        dispatch({ type: 'UPDATE_ANALYTICS', payload: {
            activePlay: currentPlay,
            placarStats: newPlacarStats,
            sugestoes: newSugestao
        }});
    }, [jogadas]);

    const adicionarNumero = useCallback((numero) => {
        const num = parseInt(numero, 10);
        if (!isNaN(num) && num >= 0 && num <= 36) dispatch({ type: 'ADD_JOGADA', payload: num });
    }, []);
    const removerUltimoNumero = useCallback(() => {
        if (jogadas.length > 0) dispatch({ type: 'REMOVE_LAST' });
    }, [jogadas.length]);
    const resetarTudo = useCallback(() => {
        if (window.confirm('Você tem certeza?')) dispatch({ type: 'RESET_ALL' });
    }, []);
    
    return { jogadas, placarStats, sugestoes, adicionarNumero, removerUltimoNumero, resetarTudo };
};

// =======================================================
// --- FUNÇÃO DE ESTATÍSTICAS COMPLETA E CORRIGIDA ---
// =======================================================
export const getEstatisticas = (jogadas) => {
    const total = jogadas.length;
    if (total === 0) return null;

    const validNumbers = jogadas.filter(n => n !== 0);
    const validTotal = validNumbers.length;

    const stats = {
        total,
        validTotal,
        reds: jogadas.filter(n => getNumberColor(n) === 'red').length,
        blacks: jogadas.filter(n => getNumberColor(n) === 'black').length,
        greens: jogadas.filter(n => n === 0).length,
        evens: validNumbers.filter(n => n % 2 === 0).length,
        odds: validNumbers.filter(n => n % 2 !== 0).length,
        dozen1: validNumbers.filter(n => n >= 1 && n <= 12).length,
        dozen2: validNumbers.filter(n => n >= 13 && n <= 24).length,
        dozen3: validNumbers.filter(n => n >= 25 && n <= 36).length,
        col1: validNumbers.filter(n => n % 3 === 1).length,
        col2: validNumbers.filter(n => n % 3 === 2).length,
        col3: validNumbers.filter(n => n % 3 === 0).length,
    };
    return stats;
};