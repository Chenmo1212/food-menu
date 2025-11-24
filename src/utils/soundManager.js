import { Howl } from 'howler';
import tapSound from '../assets/sounds/tap.mp3';
import addToCartSound from '../assets/sounds/add-to-cart.mp3';

// Create sound instances
const sounds = {
  tap: new Howl({
    src: [tapSound],
    volume: 0.5,
    preload: true
  }),
  addToCart: new Howl({
    src: [addToCartSound],
    volume: 0.6,
    preload: true
  })
};

// Sound manager with methods to play sounds
export const soundManager = {
  playTap: () => {
    sounds.tap.play();
  },
  
  playAddToCart: () => {
    sounds.addToCart.play();
  },
  
  // Method to set volume for all sounds
  setVolume: (volume) => {
    Object.values(sounds).forEach(sound => {
      sound.volume(volume);
    });
  },
  
  // Method to mute/unmute all sounds
  mute: (shouldMute) => {
    Object.values(sounds).forEach(sound => {
      sound.mute(shouldMute);
    });
  }
};

export default soundManager;

// Made with Bob
