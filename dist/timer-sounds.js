export function shouldPlayTimerSound(wasPositive,remaining,sounds,kind){
  return Boolean(wasPositive&&remaining<=0&&sounds?.enabled&&sounds?.[kind]);
}
