import { writable } from 'svelte/store';

const defaultContent = `# Welcome to the Most Interesting Demo Ever! 🎉

## What's this all about?

Imagine if Lorem Ipsum went to a comedy club and decided to become a tech writer. That's basically what you're looking at right now!

## The Usual Suspects

As per ancient tradition, we must include some dummy text. But let's make it fun:

### 🤖 AI Lorem Ipsum

In a world where GPT models dream of electric sheep, our codebase stands as a beacon of hope against the rising tide of "Hello World" programs. We've got more comments than actual code, and our git commits read like a soap opera script.

### 🎮 Gaming Lorem Ipsum

The princess is in another castle, but our documentation is right here! Press ⬆️⬆️⬇️⬇️⬅️➡️⬅️➡️BA to unlock the secret debug mode. (Warning: May cause unexpected semicolons)

### 🐛 Debug Lorem Ipsum

\`\`\`
404: Lorem not found
200: Ipsum OK
500: Server had too much coffee
\`\`\`

## Features That Don't Exist (Yet)

- Time travel debugging (only goes forward, working on backwards)
- Quantum code compilation (code simultaneously works and doesn't work)
- AI-powered coffee maker integration
- Bug-free code generator (still in beta since 1970)

## Real Talk

While this demo text is having an identity crisis, the real star of the show is that chat widget on the right. It's got all the bells and whistles:

- Smooth scrolling (smoother than a freshly debugged function)
- Real-time updates (faster than your project deadlines)
- Dark mode (because we're all vampires now)
- Responsive design (it responds better than my ex)

## Technical Mumbo Jumbo

This is where we'd normally put some serious technical documentation, but let's be honest - you're here for the chat widget. It's like having a rubber duck debugger, but this one actually talks back!

### Performance Metrics

- Time to First Joke: 0.42s
- Laughs per Minute: Variable
- Stack Overflow Visits Prevented: Many

## Conclusion

If you've read this far, you deserve a medal 🏅. Or at least a cookie 🍪. But since we can't send those through the browser (yet), here's a virtual high five instead! ✋

---

*This demo was powered by caffeine, good intentions, and probably too many late-night coding sessions.*`;

export const markdownContent = writable(defaultContent);
