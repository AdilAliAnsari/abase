import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  FlatList,
  Modal,
  Platform,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  SlidersHorizontal,
  ArrowUpDown,
  LayoutGrid,
  LayoutList,
  X,
  Star,
  CheckCircle2,
  Tv,
  Play,
  Download,
  Zap,
  GraduationCap,
  BadgeCheck,
  Clock,
} from 'lucide-react-native';
import { colors } from '../theme/colors';
import DarkGradientBg from '../components/DarkGradientBg';
import Header from '../components/Header';
import {
  mockVideos,
  VideoItem,
  videoSchemes,
  videoBranches,
  videoSemesters,
  sampleInstructors,
} from '../data/videos';
import { VideoCard } from '../components/VideoCard';
import { MXPlayerModal } from '../components/MXPlayerModal';
import { downloadPdfFile } from '../utils/pdfViewerUtils';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface VideoScreenProps {
  navigation?: any;
}

export const VideoScreen: React.FC<VideoScreenProps> = ({ navigation }) => {
  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Layout state
  const [layout, setLayout] = useState<'list' | 'grid'>('list');

  // Filter Drawer state
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Scheme Filter
  const [tempScheme, setTempScheme] = useState<string>('All Schemes');
  const [activeScheme, setActiveScheme] = useState<string>('All Schemes');

  // Branch Filter
  const [tempBranch, setTempBranch] = useState<string>('All Branches');
  const [activeBranch, setActiveBranch] = useState<string>('All Branches');

  // Semester Filter
  const [tempSemester, setTempSemester] = useState<string>('All Semesters');
  const [activeSemester, setActiveSemester] = useState<string>('All Semesters');

  // Instructor Filter
  const [tempInstructor, setTempInstructor] = useState<string>('All Lecturers');
  const [activeInstructor, setActiveInstructor] = useState<string>('All Lecturers');

  // Duration Filter
  const [tempDurationFilter, setTempDurationFilter] = useState<'all' | 'under30' | '30to60' | 'over60'>('all');
  const [activeDurationFilter, setActiveDurationFilter] = useState<'all' | 'under30' | '30to60' | 'over60'>('all');

  // Rating filter
  const [tempRatingFilter, setTempRatingFilter] = useState<number>(0);
  const [activeRatingFilter, setActiveRatingFilter] = useState<number>(0);

  // Sorting state
  const [sortBy, setSortBy] = useState<'views' | 'relevance' | 'rating' | 'durationHigh' | 'newest'>('views');
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);

  // MX Player Modal state
  const [selectedVideoForPlayer, setSelectedVideoForPlayer] = useState<VideoItem | null>(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);

  // Toast Banner State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Sync temporary filter states when modal opens
  const openFilterModal = () => {
    setTempScheme(activeScheme);
    setTempBranch(activeBranch);
    setTempSemester(activeSemester);
    setTempInstructor(activeInstructor);
    setTempDurationFilter(activeDurationFilter);
    setTempRatingFilter(activeRatingFilter);
    setIsFilterModalOpen(true);
  };

  const applyFilters = () => {
    setActiveScheme(tempScheme);
    setActiveBranch(tempBranch);
    setActiveSemester(tempSemester);
    setActiveInstructor(tempInstructor);
    setActiveDurationFilter(tempDurationFilter);
    setActiveRatingFilter(tempRatingFilter);
    setIsFilterModalOpen(false);
  };

  const clearAllFilters = () => {
    setTempScheme('All Schemes');
    setTempBranch('All Branches');
    setTempSemester('All Semesters');
    setTempInstructor('All Lecturers');
    setTempDurationFilter('all');
    setTempRatingFilter(0);
  };

  const resetAllAppliedFilters = () => {
    setActiveScheme('All Schemes');
    setActiveBranch('All Branches');
    setActiveSemester('All Semesters');
    setActiveInstructor('All Lecturers');
    setActiveDurationFilter('all');
    setActiveRatingFilter(0);
    setSearchQuery('');
  };

  // Active filters count for badge
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (activeScheme !== 'All Schemes') count++;
    if (activeBranch !== 'All Branches') count++;
    if (activeSemester !== 'All Semesters') count++;
    if (activeInstructor !== 'All Lecturers') count++;
    if (activeDurationFilter !== 'all') count++;
    if (activeRatingFilter > 0) count++;
    return count;
  }, [
    activeScheme,
    activeBranch,
    activeSemester,
    activeInstructor,
    activeDurationFilter,
    activeRatingFilter,
  ]);

  // Compute filtered & sorted Videos
  const filteredAndSortedVideos = useMemo(() => {
    let result = mockVideos.filter((video) => {
      // 1. Search Query
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        video.title.toLowerCase().includes(q) ||
        video.subjectCode.toLowerCase().includes(q) ||
        video.branch.toLowerCase().includes(q) ||
        video.scheme.toLowerCase().includes(q) ||
        video.instructor.name.toLowerCase().includes(q) ||
        video.category.toLowerCase().includes(q) ||
        video.topics.some((topic) => topic.toLowerCase().includes(q));

      // 2. Scheme
      const matchesScheme =
        activeScheme === 'All Schemes' || video.scheme === activeScheme;

      // 3. Branch
      const matchesBranch =
        activeBranch === 'All Branches' ||
        video.branch === activeBranch ||
        video.branch === 'Common';

      // 4. Semester
      let matchesSem = true;
      if (activeSemester !== 'All Semesters') {
        const semNum = parseInt(activeSemester.replace('Sem ', ''), 10);
        matchesSem = video.semester === semNum;
      }

      // 5. Instructor / Lecturer
      const matchesInstructor =
        activeInstructor === 'All Lecturers' ||
        video.instructor.name.toLowerCase() === activeInstructor.toLowerCase();

      // 6. Duration
      let matchesDuration = true;
      if (activeDurationFilter === 'under30') {
        matchesDuration = video.durationSeconds < 1800;
      } else if (activeDurationFilter === '30to60') {
        matchesDuration = video.durationSeconds >= 1800 && video.durationSeconds <= 3600;
      } else if (activeDurationFilter === 'over60') {
        matchesDuration = video.durationSeconds > 3600;
      }

      // 7. Rating
      const matchesRating = video.rating >= activeRatingFilter;

      return (
        matchesSearch &&
        matchesScheme &&
        matchesBranch &&
        matchesSem &&
        matchesInstructor &&
        matchesDuration &&
        matchesRating
      );
    });

    // Sorting
    if (sortBy === 'views') {
      result.sort((a, b) => b.viewsCount - a.viewsCount);
    } else if (sortBy === 'relevance') {
      result.sort((a, b) => {
        if (a.scheme === '2022 Scheme' && b.scheme !== '2022 Scheme') return -1;
        if (b.scheme === '2022 Scheme' && a.scheme !== '2022 Scheme') return 1;
        return b.viewsCount - a.viewsCount;
      });
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'durationHigh') {
      result.sort((a, b) => b.durationSeconds - a.durationSeconds);
    } else if (sortBy === 'newest') {
      result.sort((a, b) => b.id.localeCompare(a.id));
    }

    return result;
  }, [
    searchQuery,
    activeScheme,
    activeBranch,
    activeSemester,
    activeInstructor,
    activeDurationFilter,
    activeRatingFilter,
    sortBy,
  ]);

  // Compute results for temp filter count inside drawer
  const tempFilteredCount = useMemo(() => {
    return mockVideos.filter((video) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        video.title.toLowerCase().includes(q) ||
        video.subjectCode.toLowerCase().includes(q) ||
        video.branch.toLowerCase().includes(q) ||
        video.scheme.toLowerCase().includes(q) ||
        video.instructor.name.toLowerCase().includes(q) ||
        video.category.toLowerCase().includes(q) ||
        video.topics.some((topic) => topic.toLowerCase().includes(q));

      const matchesScheme =
        tempScheme === 'All Schemes' || video.scheme === tempScheme;

      const matchesBranch =
        tempBranch === 'All Branches' ||
        video.branch === tempBranch ||
        video.branch === 'Common';

      let matchesSem = true;
      if (tempSemester !== 'All Semesters') {
        const semNum = parseInt(tempSemester.replace('Sem ', ''), 10);
        matchesSem = video.semester === semNum;
      }

      const matchesInstructor =
        tempInstructor === 'All Lecturers' ||
        video.instructor.name.toLowerCase() === tempInstructor.toLowerCase();

      let matchesDuration = true;
      if (tempDurationFilter === 'under30') {
        matchesDuration = video.durationSeconds < 1800;
      } else if (tempDurationFilter === '30to60') {
        matchesDuration = video.durationSeconds >= 1800 && video.durationSeconds <= 3600;
      } else if (tempDurationFilter === 'over60') {
        matchesDuration = video.durationSeconds > 3600;
      }

      const matchesRating = video.rating >= tempRatingFilter;

      return (
        matchesSearch &&
        matchesScheme &&
        matchesBranch &&
        matchesSem &&
        matchesInstructor &&
        matchesDuration &&
        matchesRating
      );
    }).length;
  }, [
    searchQuery,
    tempScheme,
    tempBranch,
    tempSemester,
    tempInstructor,
    tempDurationFilter,
    tempRatingFilter,
  ]);

  const getSortLabel = () => {
    switch (sortBy) {
      case 'views':
        return 'Sort: Most Viewed';
      case 'relevance':
        return 'Sort: VTU Exam Relevance';
      case 'rating':
        return 'Sort: Student Rating';
      case 'durationHigh':
        return 'Sort: Full Courses (Longest)';
      case 'newest':
        return 'Sort: Newest Lectures';
      default:
        return 'Sort';
    }
  };

  // Handlers
  const handlePlayVideo = (video: VideoItem) => {
    setSelectedVideoForPlayer(video);
    setIsPlayerOpen(true);
  };

  const handleDownloadVideo = async (video: VideoItem) => {
    showToast(`Downloading "${video.title}"...`);
    await downloadPdfFile(video.videoUrl, video.title);
  };

  const handleNextVideo = () => {
    if (!selectedVideoForPlayer) return;
    const currentIndex = filteredAndSortedVideos.findIndex(
      (v) => v.id === selectedVideoForPlayer.id
    );
    if (currentIndex >= 0 && currentIndex < filteredAndSortedVideos.length - 1) {
      setSelectedVideoForPlayer(filteredAndSortedVideos[currentIndex + 1]);
    }
  };

  const handlePrevVideo = () => {
    if (!selectedVideoForPlayer) return;
    const currentIndex = filteredAndSortedVideos.findIndex(
      (v) => v.id === selectedVideoForPlayer.id
    );
    if (currentIndex > 0) {
      setSelectedVideoForPlayer(filteredAndSortedVideos[currentIndex - 1]);
    }
  };

  const isGrid = layout === 'grid';

  return (
    <DarkGradientBg>
      <View style={styles.screenBg}>
        <SafeAreaView style={styles.container} edges={['top']}>
          {/* Top Header: Hamburger Menu, Logo, Search Bar, Cart, User Profile */}
          <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />

          {/* Filter, Sort & Controls Sub-Bar */}
          <View style={styles.controlsBar}>
            {/* Advanced Filter Trigger */}
            <TouchableOpacity style={styles.controlBtn} onPress={openFilterModal}>
              <SlidersHorizontal size={16} color="#FFFFFF" />
              <Text style={styles.controlBtnText}>Filters</Text>
              {activeFiltersCount > 0 && (
                <View style={styles.badgeCount}>
                  <Text style={styles.badgeCountText}>{activeFiltersCount}</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Sort Selection Trigger */}
            <TouchableOpacity style={styles.controlBtn} onPress={() => setIsSortModalOpen(true)}>
              <ArrowUpDown size={16} color="#FFFFFF" />
              <Text style={styles.controlBtnText} numberOfLines={1}>
                {getSortLabel()}
              </Text>
            </TouchableOpacity>

            {/* Layout Toggle */}
            <TouchableOpacity
              style={styles.layoutToggleBtn}
              onPress={() => setLayout(isGrid ? 'list' : 'grid')}
              accessibilityLabel="Toggle Layout"
            >
              {isGrid ? (
                <LayoutList size={20} color="#FFFFFF" />
              ) : (
                <LayoutGrid size={20} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>

          {/* Quick Academic Pills Sub-Bar */}
          <View style={styles.quickPillsWrap}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.quickPillsScroll}
            >
              {[
                { label: 'All Lectures', branch: 'All Branches', scheme: 'All Schemes' },
                { label: 'CSE 2022 Scheme', branch: 'CSE', scheme: '2022 Scheme' },
                { label: 'Data Structures & Algo', branch: 'CSE', scheme: '2022 Scheme' },
                { label: 'Operating Systems', branch: 'CSE', scheme: '2022 Scheme' },
                { label: 'AIML Masterclass', branch: 'AIML', scheme: '2022 Scheme' },
                { label: 'Full-Stack Web Dev', branch: 'CSE', scheme: '2022 Scheme' },
                { label: 'Lab Demonstrations', branch: 'CSE', scheme: '2022 Scheme' },
              ].map((item, idx) => {
                const isSelected =
                  activeBranch === item.branch &&
                  (item.scheme === undefined || activeScheme === item.scheme);
                return (
                  <TouchableOpacity
                    key={idx}
                    style={[styles.quickChip, isSelected && styles.quickChipActive]}
                    onPress={() => {
                      setActiveBranch(item.branch as any);
                      if (item.scheme) setActiveScheme(item.scheme as any);
                    }}
                  >
                    <Text
                      style={[
                        styles.quickChipText,
                        isSelected && styles.quickChipTextActive,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Search Status Banner */}
          {searchQuery.trim() !== '' && (
            <View style={styles.searchStatus}>
              <Text style={styles.searchStatusText}>
                Video results for <Text style={styles.searchQueryHighlight}>"{searchQuery}"</Text>
              </Text>
            </View>
          )}

          {/* Video Player Info Banner */}
          <View style={styles.playerNoticeBanner}>
            <View style={styles.playerBadge}>
              <Text style={styles.playerBadgeText}>MX Player UI</Text>
            </View>
            <Text style={styles.playerNoticeText}>
              Interactive playback • 10s Double Tap Seek • Speed & Quality Selector • Download
            </Text>
          </View>

          {/* Scrollable Videos List / Grid */}
          <ScrollView
            style={styles.scrollContainer}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {filteredAndSortedVideos.length === 0 ? (
              <View style={styles.noResultsCard}>
                <Tv size={40} color={colors.danger} />
                <Text style={styles.noResultsTitle}>No Videos Found</Text>
                <Text style={styles.noResultsText}>
                  No video lectures match the selected filters. Try clearing filters or searching for another subject.
                </Text>
                <TouchableOpacity style={styles.resetBtn} onPress={resetAllAppliedFilters}>
                  <Text style={styles.resetBtnText}>Clear All Filters</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={isGrid ? styles.gridContainer : styles.listContainer}>
                {filteredAndSortedVideos.map((video) => (
                  <VideoCard
                    key={video.id}
                    video={video}
                    layout={layout}
                    onPlay={handlePlayVideo}
                    onDownload={handleDownloadVideo}
                  />
                ))}
              </View>
            )}
            <View style={styles.bottomSpacer} />
          </ScrollView>

          {/* Advanced Video Filters Modal (Drawer) */}
          <Modal
            visible={isFilterModalOpen}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setIsFilterModalOpen(false)}
          >
            <View style={styles.filterModalContainer}>
              <View style={styles.filterDrawerHeader}>
                <View style={styles.filterTitleRow}>
                  <GraduationCap size={22} color="#69D900" />
                  <Text style={styles.filterDrawerTitle}>Video Lecture Filters</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setIsFilterModalOpen(false)}
                  style={styles.closeModalBtn}
                >
                  <X size={22} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.filterDrawerContent} showsVerticalScrollIndicator={false}>
                {/* 1. Curriculum Scheme */}
                <Text style={styles.filterSectionTitle}>Curriculum Scheme</Text>
                <View style={styles.filterOptionsGrid}>
                  {videoSchemes.map((scheme) => {
                    const selected = tempScheme === scheme;
                    return (
                      <TouchableOpacity
                        key={scheme}
                        style={[styles.filterPill, selected && styles.filterPillSelected]}
                        onPress={() => setTempScheme(scheme)}
                      >
                        <Text
                          style={[
                            styles.filterPillText,
                            selected && styles.filterPillTextSelected,
                          ]}
                        >
                          {scheme}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <View style={styles.sectionDivider} />

                {/* 2. Branch */}
                <Text style={styles.filterSectionTitle}>Branch / Department</Text>
                <View style={styles.filterOptionsGrid}>
                  {videoBranches.map((branch) => {
                    const selected = tempBranch === branch;
                    return (
                      <TouchableOpacity
                        key={branch}
                        style={[styles.filterPill, selected && styles.filterPillSelected]}
                        onPress={() => setTempBranch(branch)}
                      >
                        <Text
                          style={[
                            styles.filterPillText,
                            selected && styles.filterPillTextSelected,
                          ]}
                        >
                          {branch}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <View style={styles.sectionDivider} />

                {/* 3. Semester */}
                <Text style={styles.filterSectionTitle}>Semester</Text>
                <View style={styles.filterOptionsGrid}>
                  {videoSemesters.map((sem) => {
                    const selected = tempSemester === sem;
                    return (
                      <TouchableOpacity
                        key={sem}
                        style={[styles.filterPill, selected && styles.filterPillSelected]}
                        onPress={() => setTempSemester(sem)}
                      >
                        <Text
                          style={[
                            styles.filterPillText,
                            selected && styles.filterPillTextSelected,
                          ]}
                        >
                          {sem}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <View style={styles.sectionDivider} />

                {/* 4. Instructor / Lecturer */}
                <Text style={styles.filterSectionTitle}>Faculty / Instructor</Text>
                <View style={styles.radioGroup}>
                  {sampleInstructors.map((lec) => {
                    const selected = tempInstructor === lec;
                    return (
                      <TouchableOpacity
                        key={lec}
                        style={styles.radioRow}
                        onPress={() => setTempInstructor(lec)}
                      >
                        <View
                          style={[
                            styles.radioButton,
                            selected && styles.radioButtonSelected,
                          ]}
                        />
                        <View style={styles.lecturerFilterRow}>
                          <Text style={styles.radioLabel}>{lec}</Text>
                          {lec !== 'All Lecturers' && (
                            <View style={styles.verifiedTag}>
                              <BadgeCheck size={12} color="#0B2405" />
                              <Text style={styles.verifiedTagText}>Verified Faculty</Text>
                            </View>
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <View style={styles.sectionDivider} />

                {/* 5. Duration */}
                <Text style={styles.filterSectionTitle}>Lecture Duration</Text>
                <View style={styles.radioGroup}>
                  <TouchableOpacity
                    style={styles.radioRow}
                    onPress={() => setTempDurationFilter('all')}
                  >
                    <View
                      style={[
                        styles.radioButton,
                        tempDurationFilter === 'all' && styles.radioButtonSelected,
                      ]}
                    />
                    <Text style={styles.radioLabel}>All Durations</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.radioRow}
                    onPress={() => setTempDurationFilter('under30')}
                  >
                    <View
                      style={[
                        styles.radioButton,
                        tempDurationFilter === 'under30' && styles.radioButtonSelected,
                      ]}
                    />
                    <Text style={styles.radioLabel}>Short Lessons (&lt; 30 mins)</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.radioRow}
                    onPress={() => setTempDurationFilter('30to60')}
                  >
                    <View
                      style={[
                        styles.radioButton,
                        tempDurationFilter === '30to60' && styles.radioButtonSelected,
                      ]}
                    />
                    <Text style={styles.radioLabel}>Standard Lectures (30 – 60 mins)</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.radioRow}
                    onPress={() => setTempDurationFilter('over60')}
                  >
                    <View
                      style={[
                        styles.radioButton,
                        tempDurationFilter === 'over60' && styles.radioButtonSelected,
                      ]}
                    />
                    <Text style={styles.radioLabel}>Complete Masterclasses (&gt; 60 mins)</Text>
                  </TouchableOpacity>
                </View>

                <View style={{ height: 60 }} />
              </ScrollView>

              {/* Drawer Footer */}
              <View style={styles.filterDrawerFooter}>
                <TouchableOpacity style={styles.clearFiltersBtn} onPress={clearAllFilters}>
                  <Text style={styles.clearFiltersBtnText}>Clear All</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.applyFiltersBtn} onPress={applyFilters}>
                  <Text style={styles.applyFiltersBtnText}>Show {tempFilteredCount} Videos</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {/* Sort Modal */}
          <Modal
            visible={isSortModalOpen}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setIsSortModalOpen(false)}
          >
            <TouchableOpacity
              style={styles.sortOverlay}
              activeOpacity={1}
              onPress={() => setIsSortModalOpen(false)}
            >
              <View style={styles.sortOptionsCard}>
                <Text style={styles.sortTitle}>Sort Video Lectures</Text>
                {[
                  { key: 'views', label: '🔥 Most Viewed Lectures' },
                  { key: 'relevance', label: '🌟 VTU Exam Relevance (2022 Scheme)' },
                  { key: 'rating', label: '⭐ Top Rated by Students' },
                  { key: 'durationHigh', label: '⏱️ Full Courses (Longest First)' },
                  { key: 'newest', label: '🆕 Newest Uploads' },
                ].map((opt) => {
                  const selected = sortBy === opt.key;
                  return (
                    <TouchableOpacity
                      key={opt.key}
                      style={[styles.sortOptionRow, selected && styles.sortOptionRowSelected]}
                      onPress={() => {
                        setSortBy(opt.key as any);
                        setIsSortModalOpen(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.sortOptionText,
                          selected && styles.sortOptionTextSelected,
                        ]}
                      >
                        {opt.label}
                      </Text>
                      {selected && <Text style={styles.sortTick}>✓</Text>}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </TouchableOpacity>
          </Modal>

          {/* MX Player Modal */}
          <MXPlayerModal
            visible={isPlayerOpen}
            video={selectedVideoForPlayer}
            onClose={() => setIsPlayerOpen(false)}
            onNextVideo={handleNextVideo}
            onPrevVideo={handlePrevVideo}
            onDownloadFeedback={(title) => showToast(`Download started for "${title}"`)}
          />

          {/* Toast Notification */}
          {toastMessage && (
            <View style={styles.toast}>
              <CheckCircle2 size={16} color="#69D900" />
              <Text style={styles.toastText} numberOfLines={2}>
                {toastMessage}
              </Text>
            </View>
          )}
        </SafeAreaView>
      </View>
    </DarkGradientBg>
  );
};

const styles = StyleSheet.create({
  screenBg: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  controlsBar: {
    flexDirection: 'row',
    height: 48,
    backgroundColor: colors.panel,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 8,
  },
  controlBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.controlBackground,
    gap: 6,
  },
  controlBtnText: {
    color: colors.primaryText,
    fontSize: 13,
    fontWeight: '500',
  },
  badgeCount: {
    backgroundColor: '#69D900',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  badgeCountText: {
    color: '#0B2405',
    fontSize: 9,
    fontWeight: '800',
  },
  layoutToggleBtn: {
    padding: 6,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.controlBackground,
    marginLeft: 'auto',
  },
  quickPillsWrap: {
    backgroundColor: 'rgba(18, 18, 24, 0.65)',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  quickPillsScroll: {
    paddingHorizontal: 14,
    gap: 6,
  },
  quickChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: 'rgba(27, 27, 41, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  quickChipActive: {
    backgroundColor: '#69D900',
    borderColor: '#7BEA12',
  },
  quickChipText: {
    color: '#B8B8C2',
    fontSize: 11,
    fontWeight: '600',
  },
  quickChipTextActive: {
    color: '#0B2405',
    fontWeight: '800',
  },
  playerNoticeBanner: {
    marginHorizontal: 14,
    marginTop: 6,
    marginBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(18, 22, 16, 0.75)',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(105, 217, 0, 0.18)',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  playerBadge: {
    backgroundColor: '#69D900',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  playerBadgeText: {
    color: '#0B2405',
    fontSize: 9,
    fontWeight: '900',
  },
  playerNoticeText: {
    color: '#B8B8C2',
    fontSize: 11,
    flex: 1,
  },
  searchStatus: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: 'transparent',
  },
  searchStatusText: {
    fontSize: 13,
    color: colors.secondaryText,
  },
  searchQueryHighlight: {
    fontWeight: '700',
    color: colors.primaryText,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 8,
  },
  listContainer: {
    flexDirection: 'column',
    paddingHorizontal: 14,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 14,
    justifyContent: 'space-between',
  },
  noResultsCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    margin: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
  },
  noResultsTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.danger,
  },
  noResultsText: {
    fontSize: 13,
    color: colors.secondaryText,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 6,
  },
  resetBtn: {
    backgroundColor: colors.buttonBackground,
    borderColor: colors.accentGreenDark,
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  resetBtnText: {
    color: colors.buttonText,
    fontWeight: '700',
    fontSize: 13,
  },
  bottomSpacer: {
    height: 100,
  },

  // Filter Drawer Styles
  filterModalContainer: {
    flex: 1,
    backgroundColor: colors.surface,
    marginTop: Platform.OS === 'ios' ? 50 : 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 20,
  },
  filterDrawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterDrawerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primaryText,
  },
  closeModalBtn: {
    padding: 4,
  },
  filterDrawerContent: {
    flex: 1,
    padding: 16,
  },
  filterSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primaryText,
    marginBottom: 10,
  },
  filterOptionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterPill: {
    backgroundColor: colors.controlBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  filterPillSelected: {
    backgroundColor: colors.accentGreen,
    borderColor: colors.accentGreenDark,
  },
  filterPillText: {
    color: colors.secondaryText,
    fontSize: 12,
    fontWeight: '500',
  },
  filterPillTextSelected: {
    color: colors.buttonText,
    fontWeight: '700',
  },
  sectionDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 16,
  },
  radioGroup: {
    flexDirection: 'column',
    gap: 10,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioButton: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.mutedText,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    borderColor: colors.accentGreen,
    backgroundColor: colors.accentGreen,
  },
  radioLabel: {
    fontSize: 13,
    color: colors.primaryText,
    fontWeight: '500',
  },
  lecturerFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  verifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#69D900',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  verifiedTagText: {
    color: '#0B2405',
    fontSize: 9,
    fontWeight: '800',
  },
  filterDrawerFooter: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    gap: 12,
  },
  clearFiltersBtn: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearFiltersBtnText: {
    color: colors.primaryText,
    fontSize: 14,
    fontWeight: '600',
  },
  applyFiltersBtn: {
    flex: 2,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.buttonBackground,
    borderColor: colors.accentGreenDark,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyFiltersBtnText: {
    color: colors.buttonText,
    fontSize: 14,
    fontWeight: '700',
  },

  // Sort Overlay Styles
  sortOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sortOptionsCard: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    width: Dimensions.get('window').width * 0.9,
    maxWidth: 380,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sortTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primaryText,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 8,
  },
  sortOptionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sortOptionRowSelected: {
    backgroundColor: colors.controlBackground,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  sortOptionText: {
    fontSize: 13,
    color: colors.secondaryText,
    flex: 1,
  },
  sortOptionTextSelected: {
    fontWeight: '700',
    color: colors.primaryText,
  },
  sortTick: {
    color: colors.accentGreen,
    fontWeight: '700',
    fontSize: 14,
    marginLeft: 8,
  },
  toast: {
    position: 'absolute',
    bottom: 95,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(18, 18, 24, 0.95)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#69D900',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 99,
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
});

export default VideoScreen;
