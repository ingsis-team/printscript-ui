import {useState} from "react";
import {TestCase} from "../../types/TestCase.ts";
import {Autocomplete, Box, Button, Chip, TextField, Typography, FormControl, InputLabel, Select, MenuItem, Alert} from "@mui/material";
import {BugReport, Delete, Save} from "@mui/icons-material";
import {useRunTestCase} from "../../utils/queries.tsx";

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

    const {mutateAsync: runTest, data: testResult, isLoading: isRunningTest} = useRunTestCase({
        onSuccess: (result) => {
            console.log('Test result:', result);
        },
        onError: (error) => {
            console.error('Test error:', error);
        }
    });

    const handleSaveTest = async () => {
        if (!testData?.name) return;
        const savedTest = await setTestCase({...testData, snippetId});
        // Update local state with the saved test (including ID)
        setTestData(savedTest);
    };

    const handleRunTest = async () => {
        if (!testData?.id) return;
        await runTest({ snippetId, testCaseId: testData.id });
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
                        <Typography fontWeight="bold">Expected Output</Typography>
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

                    {testResult && (
                        <Box display="flex" flexDirection="column" gap={1}>
                            <Alert severity={testResult.passed ? "success" : "error"}>
                                <Typography variant="body2" fontWeight="bold">
                                    {testResult.message}
                                </Typography>
                                <Box mt={1}>
                                    <Typography variant="caption" display="block">
                                        <strong>Expected Status:</strong> {testResult.expected_status}
                                    </Typography>
                                    <Typography variant="caption" display="block">
                                        <strong>Expected Outputs:</strong>
                                    </Typography>
                                    <pre style={{ margin: '4px 0', backgroundColor: '#f5f5f5', padding: '8px', borderRadius: '4px', overflow: 'auto' }}>
                                        [{(testResult.expected_outputs || []).join(', ')}]
                                    </pre>
                                    <Typography variant="caption" display="block">
                                        <strong>Actual Outputs:</strong>
                                    </Typography>
                                    <pre style={{ margin: '4px 0', backgroundColor: '#f5f5f5', padding: '8px', borderRadius: '4px', overflow: 'auto' }}>
                                        [{(testResult.actual_outputs || []).join(', ')}]
                                    </pre>
                                    {testResult.execution_failed && (
                                        <Typography variant="caption" display="block" color="error">
                                            <strong>Execution Failed</strong>
                                        </Typography>
                                    )}
                                </Box>
                            </Alert>
                        </Box>
                    )}

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
                            onClick={handleRunTest}
                            variant={"contained"}
                            startIcon={<BugReport/>}
                            disabled={!testData?.id || isRunningTest}
                            disableElevation>
                            {isRunningTest ? 'Running...' : 'Run'}
                        </Button>
                    </Box>
                </Box>
            )}
        </div>
    );
}