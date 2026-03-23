# BiddingRadar H5 Preview Template

This is a modular Vanilla JS template for the BiddingRadar iOS preview.
It simulates the iOS App behavior using standard Web technologies.

## Structure

```
preview/
├── index.html       # Entry point (Skeleton)
├── css/
│   └── style.css    # Styles (Variables, Components, Layout)
├── js/
│   ├── app.js       # Main Application Logic (State, Routing, Rendering)
│   └── data.js      # Mock Data Source
```

## Features

- **Modular Design**: Separation of HTML, CSS, and JS.
- **State Management**: Centralized state in `App.state`.
- **Routing**: Simple Tab-based navigation (`switchTab`).
- **Components**:
  - `renderList`: Renders the main bidding list.
  - `renderSubscriptionList`: Renders the subscription page.
  - `renderHomeNav`: Dynamic navigation bar.
- **Mock Data**: Extensible data generation in `data.js`.

## How to Edit

1. **Styles**: Edit `css/style.css`. Use CSS Variables for theming.
2. **Logic**: Edit `js/app.js` to change interactions or rendering logic.
3. **Data**: Edit `js/data.js` to change the mock data.

## Future Improvements

- Move to Vue.js or React for complex interactions.
- Add a build step (Vite/Webpack) if the project grows.
