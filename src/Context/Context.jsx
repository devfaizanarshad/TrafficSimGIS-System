import React, { createContext, useEffect, useState }  from "react";

export const MapContext = createContext(null);

export const ContextProvider = ({children})=>{

    const [employeeId, setEmployeeId] = useState(localStorage.getItem('employee_id'));
    const [managerId, setManagerId] = useState(localStorage.getItem('manager_id'));
    const [role , setRole] = useState(localStorage.getItem('role'));
    const [userName , setUserName] = useState(localStorage.getItem('username'));
    const [image , setImage] = useState(localStorage.getItem('image'));
useEffect(() => {
    const storedRole = localStorage.getItem('role');
    const storedUsername = localStorage.getItem('username');
    const storedImage = localStorage.getItem('image');
    const storedEmployeeId = localStorage.getItem('employee_id');
    const storedManagerId = localStorage.getItem('manager_id');
    
    setRole(storedRole);
    setUserName(storedUsername);
    setImage(storedImage);

    console.log("Before Context Manager:", storedManagerId);
    console.log("Before Context Employee:", storedEmployeeId);

    

    if (storedRole === 'Employee') {
        setEmployeeId(storedEmployeeId);
    } else if (storedRole === 'Manager') {
        console.log('I am manager');
        setManagerId(storedManagerId);
    }

    console.log("After Context Manager", managerId);
    console.log("After Context Employee:", employeeId);

    
}, []);

    return(

        <MapContext.Provider value={{employeeId, setEmployeeId, managerId, setManagerId, role , setRole,setUserName , userName, image , setImage }}>
            {children}
        </MapContext.Provider>

    )
}
