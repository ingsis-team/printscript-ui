import {useState} from "react";
import {TestCase} from "../../types/TestCase.ts";
import {Autocomplete, Box, Button, Chip, TextField, Typography, FormControl, InputLabel, Select, MenuItem} from "@mui/material";
import {BugReport, Delete, Save} from "@mui/icons-material";
import {useTestSnippet} from "../../utils/queries.tsx";

type TabPanelProps = {
    index: number;
    value: number;
    test?: TestCase;
    snippetId: string;
    setTestCase: (test: Partial<TestCase>) => Promise<TestCase>;
    removeTestCase?: (testIndex: string) => void;
}

export const TabPanel = ({value, index, test: initialTest, snippetId, setTestCase, removeTestCase}: TabPanelProps) => {
    const [testData, setTestData] = useState<Partial<TestCase> | undefined>(initialTest);

    const {mutateAsync: testSnippet, data} = useTestSnippet();
    
    const handleSaveTest = async () => {
        if (!testData?.name) return;
        const savedTest = await setTestCase({...testData, snippetId});
        // Update local state with the saved test (including ID)
        setTestData(savedTest);
    };


    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`vertical-tabpanel-${index}`}
            aria-labelledby={`vertical-tab-${index}`}
            style={{width: '100%', height: '100%'}}
        >
            {value === index && (
                <Box sx={{px: 3}} display="flex" flexDirection="column" gap={2}>
                    <Box display="flex" flexDirection="column" gap={1}>
                        <Typography fontWeight="bold">Name</Typography>
                        <TextField size="small" value={testData?.name}
                                   onChange={(e) => setTestData({...testData, name: e.target.value})}/>
                    </Box>
                    <Box display="flex" flexDirection="column" gap={1}>
                        <Typography fontWeight="bold">Expected Status</Typography>
                        <FormControl size="small" fullWidth>
                            <InputLabel id="expected-status-label">Expected Status</InputLabel>
                            <Select
                                labelId="expected-status-label"
                                value={testData?.expected_status || 'VALID'}
                                label="Expected Status"
                                onChange={(e) => setTestData({...testData, expected_status: e.target.value as 'VALID' | 'INVALID'})}
                            >
                                <MenuItem value="VALID">VALID - Test should pass</MenuItem>
                                <MenuItem value="INVALID">INVALID - Test should fail</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                    <Box display="flex" flexDirection="column" gap={1}>
                        <Typography fontWeight="bold">Input</Typography>
                        <Autocomplete
                            multiple
                            size="small"
                            id="tags-filled"
                            freeSolo
                            value={testData?.input ?? []}
                            onChange={(_, value) => setTestData({...testData, input: value})}
                            renderTags={(value: readonly string[], getTagProps) =>
                                value.map((option: string, index: number) => (
                                    <Chip variant="outlined" label={option} {...getTagProps({index})} />
                                ))
                            }
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                />
                            )}
                            options={[]}
                        />
                    </Box>
                    <Box display="flex" flexDirection="column" gap={1}>
                        <Typography fontWeight="bold">Output</Typography>
                        <Autocomplete
                            multiple
                            size="small"
                            id="tags-filled"
                            freeSolo
                            value={testData?.output ?? []}
                            onChange={(_, value) => setTestData({...testData, output: value})}
                            renderTags={(value: readonly string[], getTagProps) =>
                                value.map((option: string, index: number) => (
                                    <Chip variant="outlined" label={option} {...getTagProps({index})} />
                                ))
                            }
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                />
                            )}
                            options={[]}
                        />
                    </Box>
                    <Box display="flex" flexDirection="row" gap={1}>
                        {
                            (testData?.id && removeTestCase) && (
                            <Button onClick={() => removeTestCase(testData?.id ?? "")} variant={"outlined"} color={"error"}
                                    startIcon={<Delete/>}>
                                Remove
                            </Button>)
                        }
                        <Button disabled={!testData?.name} onClick={handleSaveTest} variant={"outlined"} startIcon={<Save/>}>
                            Save
                        </Button>
                        <Button 
                            onClick={() => {
                                const envVars = testData?.input?.join(',') || '';
                                testSnippet({ id: testData?.id ?? '', envVars });
                            }} 
                            variant={"contained"} 
                            startIcon={<BugReport/>}
                            disabled={!testData?.id}
                            disableElevation>
                            Test
                        </Button>
                        {data && (data === "success" ? <Chip label="Pass" color="success"/> :
                            <Chip label="Fail" color="error"/>)}
                    </Box>
                </Box>
            )}
        </div>
    );
}