import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { Flip } from 'gsap/Flip';
import { CustomEase } from 'gsap/CustomEase';

gsap.registerPlugin(ScrollTrigger, SplitText, Flip, CustomEase);

/* Same curves as the CSS tokens (--ease-expo / --ease-cubic / --ease-char). */
CustomEase.create('hc-expo', '.19,1,.22,1');
CustomEase.create('hc-cubic', '.215,.61,.355,1');
CustomEase.create('hc-char', '.3,.86,.36,.95');

export { gsap, ScrollTrigger, SplitText, Flip };
