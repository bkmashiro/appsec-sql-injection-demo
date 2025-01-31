import JSConfetti from "js-confetti";

export default defineNuxtPlugin(() => {
  return {
    provide: {
      confetti: new JSConfetti(),
    },
  };
});
