const profiles = {
  0: {
    1: { name: 'The Classic Ricotta Pastizz', image: '/results/classic-ricotta.png', subtitle: 'Warm, generous, unmistakably you.', text: 'You are the person people trust with the big feelings and the last piece of pastry. You make things feel considered, comforting, and quietly special.', traits: ['Big-hearted', 'Thoughtful host', 'A true classic'] },
    2: { name: 'The Ricotta & Honey Pastizz', image: '/results/ricotta-honey.png', subtitle: 'Sweetness with a spark.', text: 'Your kindness comes with momentum. You turn a good plan into a great story, and people leave your orbit feeling a little more optimistic.', traits: ['Bright spirit', 'Natural giver', 'Tastefully bold'] },
    3: { name: 'The Lemon Ricotta Pastizz', image: '/results/lemon-ricotta.png', subtitle: 'Soft centre. Sharp mind.', text: 'You have an easy warmth, but you notice everything. Your particular blend of care and curiosity makes people feel deeply understood.', traits: ['Perceptive', 'Comforting', 'Quietly brilliant'] }
  },
  1: {
    0: { name: 'The Pea & Curry Pastizz', image: '/results/pea-curry.png', subtitle: 'Life of the village festa.', text: 'You bring motion, laughter, and excellent plot twists. Your energy makes even an ordinary afternoon feel like something worth remembering.', traits: ['Magnetic', 'Spontaneous', 'Always memorable'] },
    2: { name: 'The Chilli Pea Pastizz', image: '/results/chilli-pea.png', subtitle: 'A little heat, a lot of heart.', text: 'You are fearless with your enthusiasm and generous with your attention. You know exactly when life needs a bit more flavour.', traits: ['Playful', 'Fearless', 'Full of flavour'] },
    3: { name: 'The Curry Qassata Pastizz', image: '/results/curry-qassata.png', subtitle: 'Unexpected in the best way.', text: 'You look at every familiar thing from a fresh angle. Clever, expressive, and never boring—your charm lives in the details.', traits: ['Original', 'Expressive', 'Delightfully curious'] }
  },
  2: {
    0: { name: 'The Ġbejna Pastizz', image: '/results/gbejniet.png', subtitle: 'Grounded, golden, good.', text: 'You bring a sense of ease wherever you go. People rely on your steady presence and your uncanny ability to make the simple things feel perfect.', traits: ['Dependable', 'Easy-going', 'Made for Sundays'] },
    1: { name: 'The Pea & Cheese Pastizz', image: '/results/pea-cheese.png', subtitle: 'The dependable main character.', text: 'You are practical, playful, and quietly prepared for anything. Your people know they can count on you—especially when snacks are involved.', traits: ['Capable', 'Loyal', 'Always prepared'] },
    3: { name: 'The Spinach & Feta Pastizz', image: '/results/spinach-feta.png', subtitle: 'Low-key, deeply lovely.', text: 'You have a calm presence and an intentional way of moving through the world. You choose depth over noise, and it shows.', traits: ['Intentional', 'Calm energy', 'Good taste'] }
  },
  3: {
    0: { name: 'The Mushroom Pastizz', image: '/results/mushroom.png', subtitle: 'There is more to you.', text: 'You are observant, imaginative, and always discovering a better question. Your inner world is rich—and your company is never predictable.', traits: ['Thoughtful', 'Intriguing', 'Full of depth'] },
    1: { name: 'The Truffle Pastizz', image: '/results/truffle.png', subtitle: 'Elegant with an edge.', text: 'You have a knack for making the unexpected look effortless. You are curious, discerning, and always one step ahead of the mood.', traits: ['Distinctive', 'Quick-witted', 'Naturally cool'] },
    2: { name: 'The Pistachio Pastizz', image: '/results/pistachio.png', subtitle: 'Softly iconic.', text: 'You balance imagination with a grounded kind of confidence. You do not need to be loud to leave a lasting impression.', traits: ['Creative', 'Self-assured', 'A rare find'] }
  }
};

// Each answer position represents a core trait: heart, spontaneity, grounding, or curiosity.
export function getPastizzResult(answers = []) {
  const scores = [0, 0, 0, 0];
  answers.forEach(answer => { if (Number.isInteger(answer)) scores[answer] += 1; });
  const ranked = [0, 1, 2, 3].sort((a, b) => scores[b] - scores[a] || a - b);
  const primary = ranked[0];
  const secondary = ranked.find(index => index !== primary);
  return { ...profiles[primary][secondary], id: `${primary}-${secondary}` };
}

export function getPastizzResultById(id) {
  const [primary, secondary] = String(id).split('-').map(Number);
  const profile = profiles[primary]?.[secondary] || profiles[0][1];
  return { ...profile, id: profiles[primary]?.[secondary] ? id : '0-1' };
}
