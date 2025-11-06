import './App.css';
import {RouterProvider} from "react-router";
import {createBrowserRouter} from "react-router-dom";
import HomeScreen from "./screens/Home.tsx";
import {QueryClient, QueryClientProvider} from "react-query";
import RulesScreen from "./screens/Rules.tsx";
import PrivateRoute from "./screens/PrivateRoute.tsx";

const router = createBrowserRouter([
    {
        path: "/",
        element: (
            <PrivateRoute>
                <HomeScreen />
            </PrivateRoute>
        )
    },
    {
        path: '/rules',
        element: (
            <PrivateRoute>
                <RulesScreen />
            </PrivateRoute>
        )
    },
]);

export const queryClient = new QueryClient()
const App = () => {
    return (
        <QueryClientProvider client={queryClient}>
            <RouterProvider router={router}/>
        </QueryClientProvider>
    );
}

export default App;