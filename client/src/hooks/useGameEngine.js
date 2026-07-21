import { useCallback, useEffect, useReducer, useRef } from "react";
import { createInitialState, reducer, rollDie, DOUBLE_ROLL_COST } from "../game/engine";

// Drives the turn loop: humans roll via the returned `roll()`; CPUs roll
// themselves on a timer. A roll spins the die (phase "rolling"), then the
// token walks space by space (phase "moving") until the move resolves.
const DICE_SPIN_MS = 750;
const CPU_THINK_MS = 850;
const STEP_MS = 240;

export function useGameEngine(config) {
  const [state, dispatch] = useReducer(reducer, config, createInitialState);
  const timers = useRef([]);

  const roll = useCallback((double = false) => {
    const values = double ? [rollDie(), rollDie()] : [rollDie()];
    // luck is drawn here (not in the reducer) so the reducer stays pure.
    dispatch({
      type: "START_ROLL",
      values,
      luck: Math.random(),
      cost: double ? DOUBLE_ROLL_COST : 0,
    });
    const t = setTimeout(() => dispatch({ type: "BEGIN_MOVE" }), DICE_SPIN_MS);
    timers.current.push(t);
  }, []);

  const activePlayer = state.players[state.turnIndex];
  const isCpuTurn = state.phase === "ready" && activePlayer && activePlayer.isCPU;

  // Walk the token one space per tick while a move is in progress.
  useEffect(() => {
    if (state.phase !== "moving") return undefined;
    const iv = setInterval(() => dispatch({ type: "STEP" }), STEP_MS);
    return () => clearInterval(iv);
  }, [state.phase]);

  // Auto-roll for the CPU whose turn it is; rich CPUs sometimes double down.
  useEffect(() => {
    if (!isCpuTurn) return undefined;
    const double = activePlayer.coins >= DOUBLE_ROLL_COST && Math.random() < 0.5;
    const t = setTimeout(() => roll(double), CPU_THINK_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCpuTurn, state.turnIndex, roll]);

  // Clean up any pending dice timers on unmount.
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const canRollNow = state.phase === "ready" && activePlayer && !activePlayer.isCPU;

  return { state, activePlayer, canRollNow, roll };
}
