import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
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
  Link,
  CheckCircle2,
  FileText,
  Eye,
  Download,
  Zap,
  GraduationCap,
  BadgeCheck,
  Building2,
  BookOpen,
} from 'lucide-react-native';
import { colors } from '../theme/colors';
import DarkGradientBg from '../components/DarkGradientBg';
import Header from '../components/Header';
import {
  mockPDFs,
  PDFItem,
  schemes,
  branches,
  semesters,
  materialTypes,
  sampleLecturers,
} from '../data/pdfs';
import { PDFCard } from '../components/PDFCard';
import { PDFViewerModal } from '../components/PDFViewerModal';
import { downloadPdfFile } from '../utils/pdfViewerUtils';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface PDFLibraryScreenProps {
  navigation?: any;
}

export const PDFLibraryScreen: React.FC<PDFLibraryScreenProps> = ({ navigation }) => {
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

  // Lecturer / Seller Filter
  const [tempLecturer, setTempLecturer] = useState<string>('All Lecturers');
  const [activeLecturer, setActiveLecturer] = useState<string>('All Lecturers');

  // Material Type Filter
  const [tempMaterialType, setTempMaterialType] = useState<string>('All Materials');
  const [activeMaterialType, setActiveMaterialType] = useState<string>('All Materials');

  // Rating filter
  const [tempRatingFilter, setTempRatingFilter] = useState<number>(0);
  const [activeRatingFilter, setActiveRatingFilter] = useState<number>(0);

  // Sorting state (Enhanced Re-sorted feature)
  const [sortBy, setSortBy] = useState<
    'examRelevance' | 'rating' | 'downloads' | 'facultyFirst' | 'semLow' | 'semHigh' | 'title'
  >('examRelevance');
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);

  // PDF Viewer Modal
  const [selectedPdfForViewer, setSelectedPdfForViewer] = useState<PDFItem | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  // Custom Drive/PDF URL Modal
  const [isCustomUrlModalOpen, setIsCustomUrlModalOpen] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [customUrlError, setCustomUrlError] = useState('');

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
    setTempLecturer(activeLecturer);
    setTempMaterialType(activeMaterialType);
    setTempRatingFilter(activeRatingFilter);
    setIsFilterModalOpen(true);
  };

  const applyFilters = () => {
    setActiveScheme(tempScheme);
    setActiveBranch(tempBranch);
    setActiveSemester(tempSemester);
    setActiveLecturer(tempLecturer);
    setActiveMaterialType(tempMaterialType);
    setActiveRatingFilter(tempRatingFilter);
    setIsFilterModalOpen(false);
  };

  const clearAllFilters = () => {
    setTempScheme('All Schemes');
    setTempBranch('All Branches');
    setTempSemester('All Semesters');
    setTempLecturer('All Lecturers');
    setTempMaterialType('All Materials');
    setTempRatingFilter(0);
  };

  const resetAllAppliedFilters = () => {
    setActiveScheme('All Schemes');
    setActiveBranch('All Branches');
    setActiveSemester('All Semesters');
    setActiveLecturer('All Lecturers');
    setActiveMaterialType('All Materials');
    setActiveRatingFilter(0);
    setSearchQuery('');
  };

  // Active filters count for displaying badge
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (activeScheme !== 'All Schemes') count++;
    if (activeBranch !== 'All Branches') count++;
    if (activeSemester !== 'All Semesters') count++;
    if (activeLecturer !== 'All Lecturers') count++;
    if (activeMaterialType !== 'All Materials') count++;
    if (activeRatingFilter > 0) count++;
    return count;
  }, [
    activeScheme,
    activeBranch,
    activeSemester,
    activeLecturer,
    activeMaterialType,
    activeRatingFilter,
  ]);

  // Compute filtered & sorted PDFs matching the CURRENT active filters
  const filteredAndSortedPDFs = useMemo(() => {
    let result = mockPDFs.filter((pdf) => {
      // 1. Search Query
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        pdf.title.toLowerCase().includes(q) ||
        pdf.subjectCode.toLowerCase().includes(q) ||
        pdf.branch.toLowerCase().includes(q) ||
        pdf.scheme.toLowerCase().includes(q) ||
        pdf.lecturer.name.toLowerCase().includes(q) ||
        pdf.lecturer.department.toLowerCase().includes(q) ||
        pdf.tags.some((tag) => tag.toLowerCase().includes(q));

      // 2. Scheme
      const matchesScheme =
        activeScheme === 'All Schemes' || pdf.scheme === activeScheme;

      // 3. Branch
      const matchesBranch =
        activeBranch === 'All Branches' ||
        pdf.branch === activeBranch ||
        pdf.branch === 'Common';

      // 4. Semester
      let matchesSem = true;
      if (activeSemester !== 'All Semesters') {
        const semNum = parseInt(activeSemester.replace('Sem ', ''), 10);
        matchesSem = pdf.semester === semNum;
      }

      // 5. Lecturer / Faculty Seller
      const matchesLecturer =
        activeLecturer === 'All Lecturers' ||
        pdf.lecturer.name.toLowerCase() === activeLecturer.toLowerCase();

      // 6. Material Type
      const matchesMaterial =
        activeMaterialType === 'All Materials' ||
        pdf.materialType === activeMaterialType;

      // 7. Rating filter
      const matchesRating = pdf.rating >= activeRatingFilter;

      return (
        matchesSearch &&
        matchesScheme &&
        matchesBranch &&
        matchesSem &&
        matchesLecturer &&
        matchesMaterial &&
        matchesRating
      );
    });

    // Re-sorted features
    if (sortBy === 'examRelevance') {
      // Prioritize 2022 Scheme & Top Rated & High Downloads
      result.sort((a, b) => {
        if (a.scheme === '2022 Scheme' && b.scheme !== '2022 Scheme') return -1;
        if (b.scheme === '2022 Scheme' && a.scheme !== '2022 Scheme') return 1;
        return b.downloadsCount - a.downloadsCount;
      });
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'downloads') {
      result.sort((a, b) => b.downloadsCount - a.downloadsCount);
    } else if (sortBy === 'facultyFirst') {
      result.sort((a, b) => (b.lecturer.verified ? 1 : 0) - (a.lecturer.verified ? 1 : 0));
    } else if (sortBy === 'semLow') {
      result.sort((a, b) => a.semester - b.semester);
    } else if (sortBy === 'semHigh') {
      result.sort((a, b) => b.semester - a.semester);
    } else if (sortBy === 'title') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }

    return result;
  }, [
    searchQuery,
    activeScheme,
    activeBranch,
    activeSemester,
    activeLecturer,
    activeMaterialType,
    activeRatingFilter,
    sortBy,
  ]);

  // Compute results matching the TEMPORARY filters (inside filter drawer)
  const tempFilteredCount = useMemo(() => {
    return mockPDFs.filter((pdf) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        pdf.title.toLowerCase().includes(q) ||
        pdf.subjectCode.toLowerCase().includes(q) ||
        pdf.branch.toLowerCase().includes(q) ||
        pdf.scheme.toLowerCase().includes(q) ||
        pdf.lecturer.name.toLowerCase().includes(q) ||
        pdf.lecturer.department.toLowerCase().includes(q) ||
        pdf.tags.some((tag) => tag.toLowerCase().includes(q));

      const matchesScheme =
        tempScheme === 'All Schemes' || pdf.scheme === tempScheme;

      const matchesBranch =
        tempBranch === 'All Branches' ||
        pdf.branch === tempBranch ||
        pdf.branch === 'Common';

      let matchesSem = true;
      if (tempSemester !== 'All Semesters') {
        const semNum = parseInt(tempSemester.replace('Sem ', ''), 10);
        matchesSem = pdf.semester === semNum;
      }

      const matchesLecturer =
        tempLecturer === 'All Lecturers' ||
        pdf.lecturer.name.toLowerCase() === tempLecturer.toLowerCase();

      const matchesMaterial =
        tempMaterialType === 'All Materials' ||
        pdf.materialType === tempMaterialType;

      const matchesRating = pdf.rating >= tempRatingFilter;

      return (
        matchesSearch &&
        matchesScheme &&
        matchesBranch &&
        matchesSem &&
        matchesLecturer &&
        matchesMaterial &&
        matchesRating
      );
    }).length;
  }, [
    searchQuery,
    tempScheme,
    tempBranch,
    tempSemester,
    tempLecturer,
    tempMaterialType,
    tempRatingFilter,
  ]);

  const getSortLabel = () => {
    switch (sortBy) {
      case 'examRelevance':
        return 'Sort: VTU Exam Relevance';
      case 'rating':
        return 'Sort: Student Rating';
      case 'downloads':
        return 'Sort: Most Downloaded';
      case 'facultyFirst':
        return 'Sort: Verified Faculty First';
      case 'semLow':
        return 'Sort: Semester 1 → 8';
      case 'semHigh':
        return 'Sort: Semester 8 → 1';
      case 'title':
        return 'Sort: Title (A-Z)';
      default:
        return 'Sort';
    }
  };

  // Handlers
  const handleViewPdf = (pdf: PDFItem) => {
    setSelectedPdfForViewer(pdf);
    setIsViewerOpen(true);
  };

  const handleDownloadPdf = async (pdf: PDFItem) => {
    showToast(`Downloading "${pdf.title}"...`);
    await downloadPdfFile(pdf.pdfUrl, pdf.title);
  };

  const handleOpenCustomUrl = async () => {
    if (!customUrl.trim()) {
      setCustomUrlError('Please enter a valid PDF or Google Drive URL');
      return;
    }

    const title = customTitle.trim() || 'Custom VTU Notes';
    const newPdfItem: PDFItem = {
      id: `custom-${Date.now()}`,
      title: title,
      subjectCode: 'CUSTOM',
      scheme: '2022 Scheme',
      branch: 'CSE',
      year: '2nd Year',
      semester: 3,
      university: 'VTU',
      lecturer: {
        name: 'Faculty Seller / Uploader',
        title: 'Verified Instructor',
        department: 'Dept. of Computer Science & Engg.',
        institution: 'VTU Affiliated College',
        rating: 5.0,
        verified: true,
      },
      materialType: 'Module Notes',
      author: 'Faculty Seller',
      category: 'CSE 2022 Scheme',
      fileSize: 'External',
      pageCount: 1,
      pdfUrl: customUrl.trim(),
      coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&h=700&fit=crop',
      description: 'Custom notes / Drive file loaded via URL input.',
      rating: 5.0,
      reviewsCount: 1,
      downloadsCount: 1,
      tags: ['Custom', 'VTU', 'Drive', 'PDF'],
      publishedYear: new Date().getFullYear().toString(),
    };

    setIsCustomUrlModalOpen(false);
    setCustomUrl('');
    setCustomTitle('');
    setCustomUrlError('');

    setSelectedPdfForViewer(newPdfItem);
    setIsViewerOpen(true);
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

            {/* Quick URL / Drive Paste Trigger */}
            <TouchableOpacity
              style={styles.urlTriggerBtn}
              onPress={() => setIsCustomUrlModalOpen(true)}
              accessibilityLabel="Paste Custom URL"
            >
              <Link size={15} color="#69D900" />
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
                { label: 'All Notes', branch: 'All Branches', scheme: 'All Schemes' },
                { label: 'CSE 2022 Scheme', branch: 'CSE', scheme: '2022 Scheme' },
                { label: 'CSE 3rd Sem', branch: 'CSE', scheme: '2022 Scheme', sem: 'Sem 3' },
                { label: 'CSE 5th Sem', branch: 'CSE', scheme: '2022 Scheme', sem: 'Sem 5' },
                { label: 'AIML Notes', branch: 'AIML', scheme: '2022 Scheme' },
                { label: 'ISE Notes', branch: 'ISE', scheme: '2022 Scheme' },
                { label: 'ECE Notes', branch: 'ECE', scheme: '2021 Scheme' },
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
                      if (item.sem) setActiveSemester(item.sem as any);
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

          {/* Search / Filter Status Banner */}
          {searchQuery.trim() !== '' && (
            <View style={styles.searchStatus}>
              <Text style={styles.searchStatusText}>
                Results for <Text style={styles.searchQueryHighlight}>"{searchQuery}"</Text> in VTU Engineering Notes
              </Text>
            </View>
          )}

          {/* University Board & Drive Notice Banner */}
          <View style={styles.driveBanner}>
            <View style={styles.vtuBoardTag}>
              <Text style={styles.vtuBoardTagText}>VTU Board</Text>
            </View>
            <Text style={styles.driveBannerText}>
              2022 & 2021 Scheme • Verified Faculty Notes with 1-Click Drive Viewer & Download
            </Text>
          </View>

          {/* Scrollable PDF List / Grid */}
          <ScrollView
            style={styles.scrollContainer}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {filteredAndSortedPDFs.length === 0 ? (
              <View style={styles.noResultsCard}>
                <FileText size={40} color={colors.danger} />
                <Text style={styles.noResultsTitle}>No Notes Found</Text>
                <Text style={styles.noResultsText}>
                  No PDF notes match the selected Scheme, Branch, or Lecturer filters. Try resetting filters.
                </Text>
                <TouchableOpacity style={styles.resetBtn} onPress={resetAllAppliedFilters}>
                  <Text style={styles.resetBtnText}>Clear All Filters</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={isGrid ? styles.gridContainer : styles.listContainer}>
                {filteredAndSortedPDFs.map((pdf) => (
                  <PDFCard
                    key={pdf.id}
                    pdf={pdf}
                    layout={layout}
                    onView={handleViewPdf}
                    onDownload={handleDownloadPdf}
                  />
                ))}
              </View>
            )}
            <View style={styles.bottomSpacer} />
          </ScrollView>

          {/* Advanced Academic Filters Modal (Drawer) */}
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
                  <Text style={styles.filterDrawerTitle}>VTU Academic Filters</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setIsFilterModalOpen(false)}
                  style={styles.closeModalBtn}
                >
                  <X size={22} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.filterDrawerContent} showsVerticalScrollIndicator={false}>
                {/* 1. Curriculum Scheme Filter */}
                <Text style={styles.filterSectionTitle}>Curriculum Scheme</Text>
                <View style={styles.filterOptionsGrid}>
                  {schemes.map((scheme) => {
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

                {/* 2. Engineering Branch */}
                <Text style={styles.filterSectionTitle}>Branch / Department</Text>
                <View style={styles.filterOptionsGrid}>
                  {branches.map((branch) => {
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
                  {semesters.map((sem) => {
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

                {/* 4. Lecturer / Verified Seller */}
                <Text style={styles.filterSectionTitle}>Published by Lecturer / Faculty</Text>
                <View style={styles.radioGroup}>
                  {sampleLecturers.map((lec) => {
                    const selected = tempLecturer === lec;
                    return (
                      <TouchableOpacity
                        key={lec}
                        style={styles.radioRow}
                        onPress={() => setTempLecturer(lec)}
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

                {/* 5. Material Type */}
                <Text style={styles.filterSectionTitle}>Material Type</Text>
                <View style={styles.filterOptionsGrid}>
                  {materialTypes.map((mat) => {
                    const selected = tempMaterialType === mat;
                    return (
                      <TouchableOpacity
                        key={mat}
                        style={[styles.filterPill, selected && styles.filterPillSelected]}
                        onPress={() => setTempMaterialType(mat)}
                      >
                        <Text
                          style={[
                            styles.filterPillText,
                            selected && styles.filterPillTextSelected,
                          ]}
                        >
                          {mat}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <View style={styles.sectionDivider} />

                {/* 6. Student Rating Filter */}
                <Text style={styles.filterSectionTitle}>Minimum Student Rating</Text>
                <View style={styles.radioGroup}>
                  {[0, 4.9, 4.8, 4.5].map((minRating) => {
                    const selected = tempRatingFilter === minRating;
                    return (
                      <TouchableOpacity
                        key={minRating}
                        style={styles.radioRow}
                        onPress={() => setTempRatingFilter(minRating)}
                      >
                        <View
                          style={[
                            styles.radioButton,
                            selected && styles.radioButtonSelected,
                          ]}
                        />
                        {minRating === 0 ? (
                          <Text style={styles.radioLabel}>Any Rating</Text>
                        ) : (
                          <View style={styles.starsLabelRow}>
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                size={15}
                                color="#FF9900"
                                fill={star <= Math.floor(minRating) ? '#FF9900' : 'transparent'}
                                style={{ marginRight: 2 }}
                              />
                            ))}
                            <Text style={styles.radioLabelStars}>{minRating} & Up</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <View style={{ height: 60 }} />
              </ScrollView>

              {/* Sticky bottom modal action buttons */}
              <View style={styles.filterDrawerFooter}>
                <TouchableOpacity style={styles.clearFiltersBtn} onPress={clearAllFilters}>
                  <Text style={styles.clearFiltersBtnText}>Clear All</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.applyFiltersBtn} onPress={applyFilters}>
                  <Text style={styles.applyFiltersBtnText}>Show {tempFilteredCount} Results</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {/* Re-sorted Feature Modal */}
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
                <Text style={styles.sortTitle}>Re-Sort VTU Engineering Notes</Text>
                {[
                  { key: 'examRelevance', label: '🌟 Most Relevant for VTU Exams (2022 Scheme)' },
                  { key: 'rating', label: '⭐ Top Rated by Students' },
                  { key: 'downloads', label: '📥 Most Downloaded Notes' },
                  { key: 'facultyFirst', label: '🎓 Verified Faculty Notes First' },
                  { key: 'semLow', label: '📚 Semester: Low to High (Sem 1 → 8)' },
                  { key: 'semHigh', label: '📖 Semester: High to Low (Sem 8 → 1)' },
                  { key: 'title', label: '🔤 Subject Title (A-Z)' },
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

          {/* Google Drive In-App PDF Viewer Modal */}
          <PDFViewerModal
            visible={isViewerOpen}
            pdf={selectedPdfForViewer}
            onClose={() => setIsViewerOpen(false)}
            onDownloadFeedback={(title) => showToast(`Download started for "${title}"`)}
          />

          {/* Custom Drive / PDF URL Modal */}
          <Modal
            visible={isCustomUrlModalOpen}
            animationType="fade"
            transparent={true}
            onRequestClose={() => setIsCustomUrlModalOpen(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.customModalContent}>
                <View style={styles.customModalHeader}>
                  <View style={styles.modalHeaderTitleRow}>
                    <Link size={18} color="#69D900" />
                    <Text style={styles.customModalTitle}>Open Google Drive / PDF Notes</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setIsCustomUrlModalOpen(false)}
                    style={styles.modalCloseBtn}
                  >
                    <X size={18} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>

                <Text style={styles.modalSubtitle}>
                  Paste any Google Drive share link (e.g. drive.google.com/file/d/...) or direct PDF URL to view or download.
                </Text>

                {/* Title input */}
                <Text style={styles.inputLabel}>Subject / Document Title</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. BCS304 Module 1 Notes"
                  placeholderTextColor="#8D8D94"
                  value={customTitle}
                  onChangeText={setCustomTitle}
                />

                {/* URL input */}
                <Text style={styles.inputLabel}>Google Drive or PDF URL *</Text>
                <TextInput
                  style={[styles.modalInput, !!customUrlError && styles.modalInputError]}
                  placeholder="https://drive.google.com/file/d/... or https://...pdf"
                  placeholderTextColor="#8D8D94"
                  value={customUrl}
                  onChangeText={(text) => {
                    setCustomUrl(text);
                    setCustomUrlError('');
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {!!customUrlError && (
                  <Text style={styles.errorText}>{customUrlError}</Text>
                )}

                {/* Modal Actions */}
                <View style={styles.customModalActions}>
                  <TouchableOpacity
                    style={styles.modalCancelBtn}
                    onPress={() => setIsCustomUrlModalOpen(false)}
                  >
                    <Text style={styles.modalCancelText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.modalSubmitBtn}
                    onPress={handleOpenCustomUrl}
                    activeOpacity={0.8}
                  >
                    <Eye size={16} color="#0B2405" />
                    <Text style={styles.modalSubmitText}>View in Drive</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

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
  },
  urlTriggerBtn: {
    marginLeft: 'auto',
    padding: 6,
    borderWidth: 1,
    borderColor: 'rgba(105, 217, 0, 0.3)',
    borderRadius: 8,
    backgroundColor: 'rgba(105, 217, 0, 0.1)',
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
  driveBanner: {
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
  vtuBoardTag: {
    backgroundColor: '#69D900',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  vtuBoardTagText: {
    color: '#0B2405',
    fontSize: 9,
    fontWeight: '900',
  },
  driveBannerText: {
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
  starsLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioLabelStars: {
    fontSize: 13,
    color: colors.secondaryText,
    fontWeight: '500',
    marginLeft: 4,
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

  // Custom Link Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  customModalContent: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#121218',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(105, 217, 0, 0.25)',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  customModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  customModalTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalSubtitle: {
    color: '#8D8D94',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 16,
  },
  inputLabel: {
    color: '#B8B8C2',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  modalInput: {
    height: 42,
    backgroundColor: 'rgba(27, 27, 41, 0.8)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    color: '#FFFFFF',
    fontSize: 13,
    marginBottom: 12,
  },
  modalInputError: {
    borderColor: '#FF4545',
  },
  errorText: {
    color: '#FF4545',
    fontSize: 11,
    marginTop: -8,
    marginBottom: 8,
  },
  customModalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 8,
  },
  modalCancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  modalCancelText: {
    color: '#B8B8C2',
    fontSize: 13,
    fontWeight: '600',
  },
  modalSubmitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#69D900',
  },
  modalSubmitText: {
    color: '#0B2405',
    fontSize: 13,
    fontWeight: '800',
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

export default PDFLibraryScreen;
