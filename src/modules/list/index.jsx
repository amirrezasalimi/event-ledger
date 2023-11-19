import { useLocalStorage } from '@uidotdev/usehooks';
import { useState } from 'react';


/* 
    @param {Array} expenses
    @param {Array} users
    @returns {Object} balances
*/
const calculateBalances = (expenses, users) => {
    const balances = {};
    users.forEach(user => balances[user] = 0);

    let totalExpense = 0;
    expenses.forEach(expense => {
        totalExpense += expense.amount;
        balances[expense.payer] -= expense.amount;
    });

    const fairShare = totalExpense / users.length;
    for (let user in balances) {
        balances[user] += fairShare;
    }

    return balances;
};

/* 
    @param {Object} balances
    @returns {Array} payments
*/
const calculatePayments = (balances) => {
    const payers = [];
    const receivers = [];

    for (const [user, balance] of Object.entries(balances)) {
        if (balance < 0) {
            payers.push({ name: user, amount: -balance });
        } else if (balance > 0) {
            receivers.push({ name: user, amount: balance });
        }
    }

    payers.sort((a, b) => a.amount - b.amount);
    receivers.sort((a, b) => b.amount - a.amount);

    const payments = [];
    let i = 0, j = 0;

    while (i < payers.length && j < receivers.length) {
        const payer = payers[i];
        const receiver = receivers[j];

        const amount = Math.min(payer.amount, receiver.amount);
        payments.push({ from: payer.name, to: receiver.name, amount: amount });

        payer.amount -= amount;
        receiver.amount -= amount;

        if (payer.amount === 0) i++;
        if (receiver.amount === 0) j++;
    }

    return payments;
};




function ExpenseItems() {
    const [expenses, setExpenses] = useLocalStorage('expenses', []);
    const [users] = useLocalStorage('users', []);

    // Function to calculate the balances
    const calculateBalances = (expenses, users) => {
        let balances = users.reduce((acc, user) => ({ ...acc, [user]: 0 }), {});
        let total = 0;
        expenses.forEach(expense => {
            balances[expense.payer] += expense.amount;
            total += expense.amount;
        });
        const split = total / users.length;
        Object.keys(balances).forEach(user => {
            balances[user] -= split;
        });
        return balances;
    };

    // Function to delete an expense
    const deleteExpense = (index) => {
        const updatedExpenses = [...expenses];
        updatedExpenses.splice(index, 1);
        setExpenses(updatedExpenses);
    };

    // Calculating balances on each render
    const balances = calculateBalances(expenses, users);

    return (
        <div className="bg-gray-100 min-h-screen">
            <div className="container mx-auto">
                <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                    <h2 className="text-xl font-bold mb-2">Expenses</h2>
                    {expenses.map((expense, index) => (
                        <div key={index} className="mb-2 flex justify-between items-center">
                            <span>{`${expense.title} - $${expense.amount} by ${expense.payer}`}</span>
                            <button
                                onClick={() => deleteExpense(index)}
                                className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                            >
                                Delete
                            </button>
                        </div>
                    ))}
                    {/* total */}
                    <h3 className="text-lg font-bold">Total: ${expenses.reduce((acc, expense) => acc + expense.amount, 0).toFixed(2)}</h3>
                    {/* by each */}
                    <div className="mt-6">

                        <h3 className="text-lg font-bold">By each</h3>
                        {users.map((user, index) => (
                            <div key={index} className="mb-2">
                                <span>{`${user}: $${expenses.reduce((acc, expense) => expense.payer === user ? acc + expense.amount : acc, 0).toFixed(2)}`}</span>
                            </div>
                        ))
                        }
                    </div>

                    <div className="mt-6">
                        <h3 className="text-lg font-bold">Balances</h3>
                        {Object.entries(balances).map(([user, balance], index) => (
                            <div key={index} className="mb-2">
                                <span>{`${user}: ${balance >= 0 ? 'Owes $' + balance.toFixed(2) : 'Is owed $' + (-balance).toFixed(2)}`}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}


export default function ExpenseList() {
    const [expenses, setExpenses] = useLocalStorage('expenses', []);
    const [users] = useLocalStorage('users', []); // Example users
    const [showModal, setShowModal] = useState(false);
    const [newExpense, setNewExpense] = useState({ title: '', amount: '', payer: '' });

    // Derived state for balances and payments should not be stored in state
    // if they are completely derived from expenses and users, instead,
    // they should be computed as needed to render, or memoized with useMemo.

    // Calculate balances and payments directly within the render phase
    const balances = calculateBalances(expenses, users);
    const payments = calculatePayments(balances);




    const addExpense = () => {
        const expense = {
            title: newExpense.title,
            amount: parseFloat(newExpense.amount),
            payer: newExpense.payer
        };
        setExpenses([...expenses, expense]);
        setShowModal(false);
        setNewExpense({ title: '', amount: '', payer: '' });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewExpense({ ...newExpense, [name]: value });
    };

    return (
        <div className="bg-gray-100 min-h-screen p-8">
            <div className="container mx-auto">
                {/* Payment instructions */}
                <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                    <h2 className="text-xl font-bold mb-2">Payment Instructions</h2>
                    {payments.map((payment, index) => (
                        <div key={index} className="mb-2">
                            <p>{`${payment.from} owes ${payment.to}: $${payment.amount.toFixed(0)}`}</p>
                        </div>
                    ))}
                </div>

                {/* List of expenses */}
                <ExpenseItems />
                {/* Add Expense Button */}
                <div className='sticky bottom-8'>
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                        Add Expense
                    </button>
                </div>

                {/* Add Expense Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full" id="my-modal">
                        <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                            <div className="mt-3 text-center">
                                <h3 className="text-lg leading-6 font-medium text-gray-900">Add New Expense</h3>
                                <div className="mt-2 px-7 py-3">
                                    <input
                                        name="title"
                                        type="text"
                                        placeholder="Title"
                                        value={newExpense.title}
                                        onChange={handleInputChange}
                                        className="mb-3 px-4 py-2 border rounded-md"
                                    />
                                    <input
                                        name="amount"
                                        type="number"
                                        placeholder="Amount $"
                                        value={newExpense.amount}
                                        onChange={handleInputChange}
                                        className="mb-3 px-4 py-2 border rounded-md"
                                    />
                                    <select
                                        name="payer"
                                        value={newExpense.payer}
                                        onChange={handleInputChange}
                                        className="mb-3 px-4 py-2 border rounded-md"
                                    >
                                        <option value="">Who paid?</option>
                                        {users.map((user, index) => (
                                            <option key={index} value={user}>
                                                {user}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="items-center px-4 py-3">
                                    <button
                                        id="ok-btn"
                                        onClick={addExpense}
                                        className="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                                    >
                                        Add Expense
                                    </button>
                                </div>
                                <div className="items-center px-4 py-3">
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="px-4 py-2 bg-white text-blue-700 text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-300"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
