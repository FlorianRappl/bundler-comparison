import './style.scss';
import * as React from 'react';
import { render } from 'react-dom';

const Page = React.lazy(() => import('./Page'));

const App = () => {
  const [showPage, setShowPage] = React.useState(false);

  return (
    <>
      <div className="main-content">
        <h2>Let's talk about smileys</h2>
        <p>More about smileys can be found here ...</p>
        <p>
          <img src={require('./smiley.jpg')} alt="A classic smiley" />
        </p>
        <p>
          <button onClick={() => setShowPage(!showPage)}>Toggle page</button>
        </p>
      </div>
      {showPage && <Page />}
    </>
  );
};

render(<App />, document.querySelector('#app'));
