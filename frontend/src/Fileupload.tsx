import React, { useState, ChangeEvent, useCallback } from 'react';
import './App.css'

const FileUpload: React.FC = () => {
    //todo remove nulls add better logging
    const [verificationfile, setVerificationFile] = useState<File | null>(null);
    const [verificationHashResult, setVerificationHashResult] = useState<string>("No File Registered");
    const [error, setError] = useState<string | null>(null);
    const [isVerified, setIsVerified] = useState<string | null>(null);
    const [isRegistered, setIsRegistered] = useState<string | null>(null);

    const handleVerificationFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setIsVerified(null);
            setVerificationFile(selectedFile);
            hashVerificationFile(selectedFile);
        }
    };

    const [registrationFile, setRegistrationFile] = useState<File | null>(null);
    const [registrationHash, setRegistrationHash] = useState<string>("No File Registered");

    const handleRegistrationFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedRegistrationFile = e.target.files?.[0];
        if (selectedRegistrationFile) {
            setIsRegistered(null);
            setRegistrationFile(selectedRegistrationFile);
            hashRegistrationFile(selectedRegistrationFile);
        }
    };

    const hashRegistrationFile = useCallback(async (file: File,) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const arrayBuffer = e.target?.result as ArrayBuffer;
                console.log(arrayBuffer)
                const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
                console.log(hashBuffer)
                const hashArray = Array.from(new Uint8Array(hashBuffer));

                const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
                setRegistrationHash(hashHex);

                //console.log(hashResult)

                setError(null);
            } catch (err) {
                console.log('Error hashing file: ' + (err instanceof Error ? err.message : String(err)));

                setRegistrationHash("ERROR");
            }
        };
        reader.onerror = () => {
            setError('Error reading file');
            setRegistrationHash("");
        };
        reader.readAsArrayBuffer(file);
    }, []);


    const hashVerificationFile = useCallback(async (file: File,) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const arrayBuffer = e.target?.result as ArrayBuffer;
                console.log(arrayBuffer)
                const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
                console.log(hashBuffer)
                const hashArray = Array.from(new Uint8Array(hashBuffer));

                const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
                setVerificationHashResult(hashHex);

                //console.log(hashResult)

                setError(null);
            } catch (err) {
                console.log('Error hashing file: ' + (err instanceof Error ? err.message : String(err)));

                setVerificationHashResult("ERROR");
            }
        };
        reader.onerror = () => {
            setError('Error reading file');
            setVerificationHashResult("");
        };
        reader.readAsArrayBuffer(file);
    }, []);







    const handleRegistration = () => {

        // replace with test url
        fetch('http://127.0.0.1:3000/register', {
            method: 'POST',
            body: registrationHash,
        })
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                setIsRegistered("Your File Successfully Timestamped!")
            })
            .catch((error) => {
                console.error('Error:', error);
                setIsRegistered("There Was A Problem Timestamping Your File")
            });

    };

    const handleVerify = () => {

        fetch('http://127.0.0.1:3000/verify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: verificationHashResult,
        })
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                setIsVerified(data.output);
                console.log(isVerified)
            })
            .catch((error) => {
                console.error('Error:', error);
                setIsVerified(null);
            });
    };

    return (
        <div>
            <div className='upload-card'>
                <div className='card-content'>
                    <div >Get A File Timestamp</div>
                    <div>
                        <input type="file" onChange={handleVerificationFileChange} />
                        <button onClick={handleVerify} disabled={false}>
                            Check
                        </button>
                        {isVerified && <p>{isVerified}</p>}
                    </div>
                </div>
            </div >
            <div className='upload-card'>

                <div className='card-content'>
                    <div >Timestamp A File</div>
                    <div>
                        <input type="file" onChange={handleRegistrationFileChange} />
                        <button onClick={handleRegistration} disabled={false}>
                            Register
                        </button>
                        {isRegistered && <p>{isRegistered}</p>}
                    </div>
                </div>
            </div >
        </div>
    );
};

export default FileUpload;
