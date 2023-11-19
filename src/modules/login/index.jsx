import { useLocalStorage } from "@uidotdev/usehooks";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const [name, setName] = useLocalStorage('name', '');
    const [users, setUsers] = useLocalStorage('users', []); // Example users

    const nav = useNavigate();
    const handleJoin = (e) => {
        e.preventDefault();
        // ... you can add more logic here if needed
        if (!users.includes(name)) {
            console.log('User Added:', name);
            setUsers([...users, name]);
        }
    };
    const goToList = () => nav('/list');

    return (
        <div className="flex items-center justify-center h-screen bg-blue-900">
            <div className="w-full max-w-xs">
                <form onSubmit={handleJoin} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                    {/* users */}
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                            Users
                        </label>
                        <ul>
                            {users.map((user, i) => (
                                <li key={i}>{user}</li>
                            ))}
                        </ul>
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                            Your name
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="username"
                            type="text"
                            placeholder="Amir"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <button
                            className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            type="submit"
                        >
                            Add user
                        </button>
                        <button
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            type="button"
                            onClick={goToList}
                        >
                            Go to list
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
