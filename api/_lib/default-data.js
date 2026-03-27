const DEFAULT_DATA = {
  members: [
    {
      id: 'kabir',
      name: 'Kabir',
      avatar: '🦸‍♂️',
      color: '#4d96ff',
      habits: [
        { id: 'kabir_h1', name: 'Brush teeth (morning)', points: 5 },
        { id: 'kabir_h2', name: 'Brush teeth (night)', points: 5 },
        { id: 'kabir_h3', name: 'Read for 20 mins', points: 15 },
        { id: 'kabir_h4', name: 'Practice writing', points: 10 },
        { id: 'kabir_h5', name: 'Eat fruits/veggies', points: 10 },
        { id: 'kabir_h6', name: 'Tidy up toys', points: 10 },
        { id: 'kabir_h7', name: 'No screen before bed', points: 15 },
        { id: 'kabir_h8', name: 'Be kind to Mihir', points: 10 },
        { id: 'kabir_h9', name: 'Drink 5 glasses water', points: 10 },
        { id: 'kabir_h10', name: 'Say please & thank you', points: 10 }
      ]
    },
    {
      id: 'mihir',
      name: 'Mihir',
      avatar: '👶',
      color: '#c77dff',
      habits: [
        { id: 'mihir_h1', name: 'Nap on schedule', points: 15 },
        { id: 'mihir_h2', name: 'Eat full meals', points: 15 },
        { id: 'mihir_h3', name: 'Playtime activity', points: 10 },
        { id: 'mihir_h4', name: 'Outdoor time', points: 15 },
        { id: 'mihir_h5', name: 'Bath time', points: 10 }
      ]
    },
    {
      id: 'anish',
      name: 'Anish',
      avatar: '🚀',
      color: '#ff6b6b',
      habits: [
        { id: 'anish_h1', name: 'Morning workout', points: 20 },
        { id: 'anish_h2', name: 'Read 30 mins', points: 15 },
        { id: 'anish_h3', name: 'No phone at meals', points: 10 },
        { id: 'anish_h4', name: 'Meditate 10 mins', points: 15 },
        { id: 'anish_h5', name: 'Journal / reflect', points: 10 },
        { id: 'anish_h6', name: 'Sleep by 11 PM', points: 15 },
        { id: 'anish_h7', name: 'Walk 8000 steps', points: 15 },
        { id: 'anish_h8', name: 'Drink 3L water', points: 10 },
        { id: 'anish_h9', name: 'Quality time with kids', points: 15 },
        { id: 'anish_h10', name: 'Plan tomorrow', points: 10 }
      ]
    },
    {
      id: 'spouse',
      name: 'Partner',
      avatar: '💫',
      color: '#ffd93d',
      habits: [
        { id: 'spouse_h1', name: 'Morning routine', points: 15 },
        { id: 'spouse_h2', name: 'Exercise / yoga', points: 20 },
        { id: 'spouse_h3', name: 'Read 20 mins', points: 15 },
        { id: 'spouse_h4', name: 'Healthy meals prep', points: 10 },
        { id: 'spouse_h5', name: 'No phone at meals', points: 10 },
        { id: 'spouse_h6', name: 'Self-care time', points: 15 },
        { id: 'spouse_h7', name: 'Quality time with kids', points: 15 },
        { id: 'spouse_h8', name: 'Sleep by 11 PM', points: 15 },
        { id: 'spouse_h9', name: 'Drink 3L water', points: 10 },
        { id: 'spouse_h10', name: 'Gratitude practice', points: 10 }
      ]
    }
  ],
  completions: {}
};

function cloneDefaultData() {
  return JSON.parse(JSON.stringify(DEFAULT_DATA));
}

module.exports = {
  DEFAULT_DATA,
  cloneDefaultData
};
