import { useState, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Paper,
  Chip,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItemButton,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  LinkOff as UnmapIcon,
  Link as MapIcon,
  Search as SearchIcon,
  SportsEsports as TwitchIcon,
} from '@mui/icons-material';
import { AccessGate } from '@/components/clipping/AccessGate';
import { useSourceChannels } from '@/hooks/useSourceChannels';
import { useTwitchMappings } from '@/hooks/useTwitchMappings';
import type { TwitchChannelSearchResult } from '@/types/clipping.types';

// ── Helpers ────────────────────────────────────────────────────────────────

function MappingStatusChip({ status }: { status?: string }) {
  if (status === 'mapped') return <Chip label="Mapped" color="success" size="small" />;
  if (status === 'no_twitch_equivalent') return <Chip label="No Twitch Equivalent" size="small" />;
  return <Chip label="Unmapped" color="warning" size="small" />;
}

// ── Add Twitch Channel Dialog ──────────────────────────────────────────────

interface AddTwitchChannelDialogProps {
  open: boolean;
  onClose: () => void;
  searchResults: TwitchChannelSearchResult[];
  isSearching: boolean;
  onSearch: (q: string) => void;
  onClearSearch: () => void;
  onAdd: (broadcasterId: string) => void;
  isAdding: boolean;
}

function AddTwitchChannelDialog({
  open,
  onClose,
  searchResults,
  isSearching,
  onSearch,
  onClearSearch,
  onAdd,
  isAdding,
}: AddTwitchChannelDialogProps) {
  const [query, setQuery] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleQueryChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => onSearch(value), 500);
  };

  const handleClose = () => {
    setQuery('');
    onClearSearch();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Twitch Channel</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          fullWidth
          label="Search Twitch channels"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} /> }}
          sx={{ mt: 1 }}
        />
        {isSearching && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}
        {searchResults.length > 0 && (
          <List dense sx={{ mt: 1 }}>
            {searchResults.map((ch) => (
              <ListItemButton
                key={ch.broadcaster_id}
                onClick={() => {
                  onAdd(ch.broadcaster_id);
                  handleClose();
                }}
                disabled={isAdding}
              >
                <ListItemAvatar>
                  <Avatar src={ch.profile_image_url ?? undefined} sx={{ width: 32, height: 32 }}>
                    <TwitchIcon fontSize="small" />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText primary={ch.display_name} secondary={`@${ch.broadcaster_login}`} />
              </ListItemButton>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Create Mapping Dialog ──────────────────────────────────────────────────

interface CreateMappingDialogProps {
  open: boolean;
  onClose: () => void;
  youtubeChannelId: number;
  youtubeChannelName: string;
  searchResults: TwitchChannelSearchResult[];
  isSearching: boolean;
  onSearch: (q: string) => void;
  onClearSearch: () => void;
  twitchChannels: { id: number; broadcaster_id: string; display_name: string; profile_image_url: string | null }[];
  onCreate: (youtubeId: number, twitchId: number) => void;
  isCreating: boolean;
}

function CreateMappingDialog({
  open,
  onClose,
  youtubeChannelId,
  youtubeChannelName,
  searchResults,
  isSearching,
  onSearch,
  onClearSearch,
  twitchChannels,
  onCreate,
  isCreating,
}: CreateMappingDialogProps) {
  const [query, setQuery] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleQueryChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => onSearch(value), 500);
  };

  const handleClose = () => {
    setQuery('');
    onClearSearch();
    onClose();
  };

  // Show already-added Twitch channels when no search query
  const showExisting = !query.trim() && twitchChannels.length > 0;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Map "{youtubeChannelName}" to Twitch</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          fullWidth
          label="Search Twitch channels"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} /> }}
          sx={{ mt: 1 }}
        />
        {isSearching && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}
        {showExisting && (
          <>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Your added Twitch channels
            </Typography>
            <List dense>
              {twitchChannels.map((ch) => (
                <ListItemButton
                  key={ch.id}
                  onClick={() => { onCreate(youtubeChannelId, ch.id); handleClose(); }}
                  disabled={isCreating}
                >
                  <ListItemAvatar>
                    <Avatar src={ch.profile_image_url ?? undefined} sx={{ width: 32, height: 32 }}>
                      <TwitchIcon fontSize="small" />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText primary={ch.display_name} />
                </ListItemButton>
              ))}
            </List>
          </>
        )}
        {searchResults.length > 0 && (
          <List dense sx={{ mt: 1 }}>
            {searchResults.map((ch) => (
              <ListItemButton
                key={ch.broadcaster_id}
                onClick={() => {
                  // For search results we need to find the matching stored channel by broadcaster_id
                  const stored = twitchChannels.find((t) => t.broadcaster_id === ch.broadcaster_id);
                  if (stored) {
                    onCreate(youtubeChannelId, stored.id);
                    handleClose();
                  }
                }}
                disabled={isCreating || !twitchChannels.some((t) => t.broadcaster_id === ch.broadcaster_id)}
              >
                <ListItemAvatar>
                  <Avatar src={ch.profile_image_url ?? undefined} sx={{ width: 32, height: 32 }}>
                    <TwitchIcon fontSize="small" />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={ch.display_name}
                  secondary={
                    twitchChannels.some((t) => t.broadcaster_id === ch.broadcaster_id)
                      ? undefined
                      : 'Add this channel first'
                  }
                />
              </ListItemButton>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

export function TwitchMappingsPage() {
  const {
    mappings,
    twitchChannels,
    isMappingsLoading,
    searchResults,
    isSearching,
    searchChannels,
    clearSearch,
    addTwitchChannel,
    createMapping,
    deleteMapping,
    isAddingChannel,
    isCreatingMapping,
  } = useTwitchMappings();

  const { channels: sourceChannels, isLoading: isSourceChannelsLoading } = useSourceChannels();

  const [addChannelOpen, setAddChannelOpen] = useState(false);
  const [mappingTarget, setMappingTarget] = useState<{ id: number; name: string } | null>(null);

  // Source channels that are unmapped (and not "no_twitch_equivalent")
  const unmappedChannels = sourceChannels.filter(
    (ch) => !ch.twitch_mapping_status || ch.twitch_mapping_status === 'unmapped'
  );

  const isLoading = isMappingsLoading || isSourceChannelsLoading;

  return (
    <AccessGate>
      <Box>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" gutterBottom>
              Twitch Mappings
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Link each YouTube source channel to its Twitch equivalent for fallback clipping.
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setAddChannelOpen(true)}
          >
            Add Twitch Channel
          </Button>
        </Box>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Active Mappings */}
            <Paper sx={{ mb: 3 }}>
              <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h6">Active Mappings</Typography>
              </Box>
              {mappings.length === 0 ? (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <Typography color="text.secondary">No active mappings yet.</Typography>
                </Box>
              ) : (
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>YouTube Channel</TableCell>
                      <TableCell align="center">→</TableCell>
                      <TableCell>Twitch Channel</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mappings.map((m) => (
                      <TableRow key={m.id}>
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>
                            {m.youtube_channel_name}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <MapIcon color="action" />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <TwitchIcon fontSize="small" color="action" />
                            <Typography variant="body2">{m.twitch_display_name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              @{m.broadcaster_login}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Button
                            size="small"
                            color="error"
                            variant="outlined"
                            startIcon={<UnmapIcon />}
                            onClick={() => deleteMapping(m.id)}
                          >
                            Unmap
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Paper>

            <Divider sx={{ my: 3 }} />

            {/* Unmapped YouTube Channels */}
            <Paper>
              <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h6">Unmapped YouTube Channels</Typography>
              </Box>
              {unmappedChannels.length === 0 ? (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <Typography color="text.secondary">All channels are mapped.</Typography>
                </Box>
              ) : (
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Channel</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sourceChannels
                      .filter((ch) => (ch.twitch_mapping_status ?? 'unmapped') !== 'mapped')
                      .map((ch) => (
                        <TableRow key={ch.id}>
                          <TableCell>
                            <Typography variant="body2" fontWeight={500}>
                              {ch.channel_title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {ch.channel_url}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <MappingStatusChip status={ch.twitch_mapping_status} />
                          </TableCell>
                          <TableCell align="right">
                            {ch.twitch_mapping_status !== 'no_twitch_equivalent' && (
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<MapIcon />}
                                onClick={() =>
                                  setMappingTarget({ id: Number(ch.id), name: ch.channel_title })
                                }
                              >
                                Map to Twitch
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              )}
            </Paper>
          </>
        )}

        {/* Add Twitch Channel Dialog */}
        <AddTwitchChannelDialog
          open={addChannelOpen}
          onClose={() => setAddChannelOpen(false)}
          searchResults={searchResults}
          isSearching={isSearching}
          onSearch={searchChannels}
          onClearSearch={clearSearch}
          onAdd={(broadcasterId) => addTwitchChannel({ broadcaster_id: broadcasterId })}
          isAdding={isAddingChannel}
        />

        {/* Create Mapping Dialog */}
        {mappingTarget && (
          <CreateMappingDialog
            open={!!mappingTarget}
            onClose={() => setMappingTarget(null)}
            youtubeChannelId={mappingTarget.id}
            youtubeChannelName={mappingTarget.name}
            searchResults={searchResults}
            isSearching={isSearching}
            onSearch={searchChannels}
            onClearSearch={clearSearch}
            twitchChannels={twitchChannels}
            onCreate={(youtubeId, twitchId) =>
              createMapping({
                youtube_source_channel_id: youtubeId,
                twitch_source_channel_id: twitchId,
              })
            }
            isCreating={isCreatingMapping}
          />
        )}
      </Box>
    </AccessGate>
  );
}
