import {Autocomplete, Box, Button, Divider, TextField, Typography} from "@mui/material";
import {ModalWrapper} from "../common/ModalWrapper.tsx";
import {useEffect, useState} from "react";
import {User} from "../../utils/users.ts";

type ShareSnippetModalProps = {
  open: boolean
  onClose: () => void
  onShare: (userId: string) => void
  loading: boolean
}

export const ShareSnippetModal = (props: ShareSnippetModalProps) => {
  const {open, onClose, onShare, loading} = props
  const [name, setName] = useState("")
  const [selectedUser, setSelectedUser] = useState<User | undefined>()
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)

  // Fetch users when modal opens
  useEffect(() => {
    if (open && allUsers.length === 0) {
      const fetchUsers = async () => {
        setIsLoadingUsers(true)
        try {
          const { RealSnippetOperations } = await import('../../utils/mock/RealSnippetOperations')
          const snippetOperations = new RealSnippetOperations()
          const result = await snippetOperations.getUserFriends(0, 100) // Fetch all users (high page size)
          setAllUsers(result.users)
          setFilteredUsers(result.users)
        } catch (error) {
          console.error('Error fetching users:', error)
        } finally {
          setIsLoadingUsers(false)
        }
      }
      fetchUsers()
    }
  }, [open, allUsers.length])

  // Filter users based on search input
  useEffect(() => {
    if (name.trim() === '') {
      setFilteredUsers(allUsers)
    } else {
      const searchLower = name.toLowerCase()
      const filtered = allUsers.filter(user =>
        user.email.toLowerCase().includes(searchLower) ||
        user.nickname.toLowerCase().includes(searchLower) ||
        user.name.toLowerCase().includes(searchLower)
      )
      setFilteredUsers(filtered)
    }
  }, [name, allUsers])

  function handleSelectUser(newValue: User | null) {
    if (newValue) {
      setSelectedUser(newValue)
    }
  }

  return (
      <ModalWrapper open={open} onClose={onClose}>
        <Typography variant={"h5"}>Share your snippet</Typography>
        <Divider/>
        <Box mt={2}>
          <Autocomplete
              renderInput={(params) => <TextField {...params} label="Search by email or nickname"/>}
              options={filteredUsers}
              getOptionKey={(option) => option.user_id}
              isOptionEqualToValue={(option, value) => option.user_id === value.user_id}
              getOptionLabel={(option) => `${option.email} (${option.nickname})`}
              renderOption={(props, option) => {
                return (
                  <Box component="li" {...props} key={option.user_id} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', py: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                      {option.email}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      @{option.nickname}
                    </Typography>
                  </Box>
                )
              }}
              loading={isLoadingUsers}
              value={selectedUser}
              onInputChange={(_: unknown, newValue: string) => setName(newValue)}
              onChange={(_: unknown, newValue: User | null) => handleSelectUser(newValue)}
              clearOnBlur={false}
              blurOnSelect={false}
          />
          <Box mt={4} display={"flex"} width={"100%"} justifyContent={"flex-end"}>
            <Button onClick={onClose} variant={"outlined"}>Cancel</Button>
            <Button
              disabled={!selectedUser || loading}
              onClick={() => selectedUser && onShare(selectedUser.user_id)}
              sx={{marginLeft: 2}}
              variant={"contained"}
            >
              Share
            </Button>
          </Box>
        </Box>
      </ModalWrapper>
  )
}
