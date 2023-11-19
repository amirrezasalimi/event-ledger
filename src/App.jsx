import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import Login from './modules/login';
import ExpenseList from './modules/list';
const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />
  },
  {
    path: "/list",
    element: <ExpenseList />
  },
]);
function App() {
  return (
    <RouterProvider router={router} />
  )
}

export default App
