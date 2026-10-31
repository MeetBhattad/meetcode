import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axiosClient from '../utils/axiosClient';
import { useNavigate, NavLink } from 'react-router';
import { ArrowLeft, Plus, Trash2, Save, Code2, AlignLeft, CheckCircle2, BookOpen } from 'lucide-react';

// Zod schema matching the updated problem schema
const problemSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  tags: z.enum([
    'array', 'string', 'hashMap', 'twoPointers', 'slidingWindow', 
    'stack', 'binarySearch', 'linkedList', 'tree', 'trie', 
    'heap', 'backtracking', 'graph', 'dp', 'greedy', 
    'intervals', 'math', 'bitManipulation'
  ]),
  visibleTestCases: z.array(
    z.object({
      input: z.string().min(1, 'Input is required'),
      output: z.string().min(1, 'Output is required'),
      explanation: z.string().min(1, 'Explanation is required')
    })
  ).min(1, 'At least one visible test case required'),
  hiddenTestCases: z.array(
    z.object({
      input: z.string().min(1, 'Input is required'),
      output: z.string().min(1, 'Output is required')
    })
  ).min(1, 'At least one hidden test case required'),
  startCode: z.array(
    z.object({
      language: z.enum(['C++', 'Java', 'Python']),
      initialCode: z.string().min(1, 'Initial code is required')
    })
  ).length(3, 'All three languages required'),
  referenceSolution: z.array(
    z.object({
      language: z.enum(['C++', 'Java', 'Python']),
      completeCode: z.string().min(1, 'Complete code is required')
    })
  ).length(3, 'All three languages required'),
  testHarness: z.array(
    z.object({
      language: z.enum(['C++', 'Java', 'Python']),
      harnessCode: z.string().min(1, 'Test harness is required')
    })
  ).length(3, 'All three languages required'),
  editorialResources: z.array(
  z.object({
    type: z.enum(['youtube', 'article', 'video', 'ai']),
    url: z.string().url('Must be a valid URL'),
    title: z.string().min(1, 'Title is required'),
    author: z.string().optional(),
  })
).optional().default([]),
});

const inputStyle = "w-full bg-[#0d1117] border border-white/[0.08] rounded-lg px-4 py-2.5 text-[13.5px] text-white/90 outline-none placeholder:text-white/20 transition-all focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/[0.08] hover:border-white/[0.15]";
const labelStyle = "block text-[12px] font-medium text-white/50 mb-2 tracking-wide uppercase";
const codeAreaStyle = "w-full bg-[#0d1117] border border-white/[0.08] rounded-lg p-4 font-mono text-[12px] leading-relaxed text-white/80 outline-none focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/[0.08] resize-y min-h-[160px]";

function AdminPanel() {
  const navigate = useNavigate();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(problemSchema),
    defaultValues: {
      difficulty: 'easy',
      tags: 'array',
      visibleTestCases: [{ input: '', output: '', explanation: '' }],
      hiddenTestCases: [{ input: '', output: '' }],
      startCode: [
        { language: 'C++', initialCode: '' },
        { language: 'Java', initialCode: '' },
        { language: 'Python', initialCode: '' }
      ],
      referenceSolution: [
        { language: 'C++', completeCode: '' },
        { language: 'Java', completeCode: '' },
        { language: 'Python', completeCode: '' }
      ],
      testHarness: [
        { language: 'C++', harnessCode: '' },
        { language: 'Java', harnessCode: '' },
        { language: 'Python', harnessCode: '' }
      ],
      editorialResources: []
    }
  });

  const { fields: visibleFields, append: appendVisible, remove: removeVisible } = useFieldArray({ control, name: 'visibleTestCases' });
  const { fields: hiddenFields, append: appendHidden, remove: removeHidden } = useFieldArray({ control, name: 'hiddenTestCases' });
  const {
  fields: editorialFields,
  append: appendEditorial,
  remove: removeEditorial,
} = useFieldArray({ control, name: 'editorialResources' });

  const onSubmit = async (data) => {
    try {
      await axiosClient.post('/problem/create', data);
      navigate('/admin'); // Redirect back to admin dashboard on success
    } catch (error) {
      alert(`Error: ${error.response?.data?.error || error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#07070a] text-white selection:bg-violet-500/30 pb-20">
      
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[800px] h-[600px] rounded-full" style={{ background: 'radial-gradient(ellipse at top right, rgba(139,92,246,0.06), transparent 70%)' }} />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 pt-12">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <NavLink to="/admin" className="w-10 h-10 rounded-full border border-white/[0.08] flex items-center justify-center text-white/50 hover:text-white hover:bg-white/[0.04] transition-all">
            <ArrowLeft size={18} />
          </NavLink>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">Create New Problem</h1>
            <p className="text-[13.5px] text-white/40 mt-1">Add a new coding challenge to the platform.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          
          {/* ──────────── SECTION 1: BASIC INFO ──────────── */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] p-6 shadow-2xl shadow-black/50">
            <div className="flex items-center gap-2 mb-6 border-b border-white/[0.06] pb-4">
              <AlignLeft size={16} className="text-violet-400" />
              <h2 className="text-[15px] font-medium text-white/90">Basic Information</h2>
            </div>
            
            <div className="grid gap-5">
              <div>
                <label className={labelStyle}>Title</label>
                <input {...register('title')} placeholder="e.g. Two Sum" className={inputStyle} />
                {errors.title && <span className="text-rose-400 text-[11px] mt-1">{errors.title.message}</span>}
              </div>

              <div>
                <label className={labelStyle}>Description</label>
                <textarea {...register('description')} placeholder="Provide a clear description of the problem..." className={`${inputStyle} min-h-[120px] resize-y`} />
                {errors.description && <span className="text-rose-400 text-[11px] mt-1">{errors.description.message}</span>}
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className={labelStyle}>Difficulty</label>
                  <select {...register('difficulty')} className={inputStyle} style={{ colorScheme: 'dark' }}>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label className={labelStyle}>Tag</label>
                  <select {...register('tags')} className={inputStyle} style={{ colorScheme: 'dark' }}>
                    <option value="array">Array</option>
                    <option value="string">String</option>
                    <option value="hashMap">Hash Map</option>
                    <option value="twoPointers">Two Pointers</option>
                    <option value="slidingWindow">Sliding Window</option>
                    <option value="stack">Stack</option>
                    <option value="binarySearch">Binary Search</option>
                    <option value="linkedList">Linked List</option>
                    <option value="tree">Tree</option>
                    <option value="trie">Trie</option>
                    <option value="heap">Heap</option>
                    <option value="backtracking">Backtracking</option>
                    <option value="graph">Graph</option>
                    <option value="dp">Dynamic Programming</option>
                    <option value="greedy">Greedy</option>
                    <option value="intervals">Intervals</option>
                    <option value="math">Math</option>
                    <option value="bitManipulation">Bit Manipulation</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* ──────────── SECTION 2: TEST CASES ──────────── */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] p-6 shadow-2xl shadow-black/50">
            <div className="flex items-center gap-2 mb-6 border-b border-white/[0.06] pb-4">
              <CheckCircle2 size={16} className="text-violet-400" />
              <h2 className="text-[15px] font-medium text-white/90">Test Cases</h2>
            </div>
            
            {/* Visible Test Cases */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-[13px] font-medium text-white/70">Visible Test Cases</h3>
                <button type="button" onClick={() => appendVisible({ input: '', output: '', explanation: '' })} className="flex items-center gap-1.5 text-[12px] font-medium text-violet-400 hover:text-violet-300 transition-colors">
                  <Plus size={14} /> Add Visible Case
                </button>
              </div>
              <div className="space-y-4">
                {visibleFields.map((field, index) => (
                  <div key={field.id} className="relative p-4 rounded-xl border border-white/[0.04] bg-white/[0.02]">
                    <button type="button" onClick={() => removeVisible(index)} className="absolute top-3 right-3 text-white/20 hover:text-rose-400 transition-colors">
                      <Trash2 size={14} />
                    </button>
                    <div className="grid gap-3">
                      <input {...register(`visibleTestCases.${index}.input`)} placeholder="Input (e.g. 1 2\n3)" className={`${inputStyle} font-mono text-xs`} />
                      <input {...register(`visibleTestCases.${index}.output`)} placeholder="Expected Output (e.g. 3)" className={`${inputStyle} font-mono text-xs`} />
                      <textarea {...register(`visibleTestCases.${index}.explanation`)} placeholder="Explanation..." className={`${inputStyle} text-xs min-h-[60px]`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hidden Test Cases */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-[13px] font-medium text-white/70">Hidden Test Cases</h3>
                <button type="button" onClick={() => appendHidden({ input: '', output: '' })} className="flex items-center gap-1.5 text-[12px] font-medium text-violet-400 hover:text-violet-300 transition-colors">
                  <Plus size={14} /> Add Hidden Case
                </button>
              </div>
              <div className="space-y-4">
                {hiddenFields.map((field, index) => (
                  <div key={field.id} className="relative p-4 rounded-xl border border-white/[0.04] bg-white/[0.02]">
                    <button type="button" onClick={() => removeHidden(index)} className="absolute top-3 right-3 text-white/20 hover:text-rose-400 transition-colors">
                      <Trash2 size={14} />
                    </button>
                    <div className="grid gap-3">
                      <input {...register(`hiddenTestCases.${index}.input`)} placeholder="Input (e.g. 2 3\n5)" className={`${inputStyle} font-mono text-xs`} />
                      <input {...register(`hiddenTestCases.${index}.output`)} placeholder="Expected Output (e.g. 5)" className={`${inputStyle} font-mono text-xs`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ──────────── SECTION 3: CODE CONFIGURATION ──────────── */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] p-6 shadow-2xl shadow-black/50">
            <div className="flex items-center gap-2 mb-6 border-b border-white/[0.06] pb-4">
              <Code2 size={16} className="text-violet-400" />
              <h2 className="text-[15px] font-medium text-white/90">Code Configuration</h2>
            </div>

            <div className="space-y-10">
              {[0, 1, 2].map((index) => {
                const langName = index === 0 ? 'C++' : index === 1 ? 'Java' : 'Python';
                return (
                  <div key={index} className="space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-md bg-violet-500/10 text-violet-400 text-[11px] font-bold tracking-wider uppercase border border-violet-500/20">
                        {langName}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[12px] text-white/40 mb-1.5 block">Initial Code (Stub)</label>
                        <textarea {...register(`startCode.${index}.initialCode`)} placeholder={`// Function definition for ${langName}`} className={codeAreaStyle} />
                        {errors.startCode?.[index]?.initialCode && <span className="text-rose-400 text-[11px]">{errors.startCode[index].initialCode.message}</span>}
                        <input type="hidden" {...register(`startCode.${index}.language`)} value={langName} />
                      </div>
                      <div>
                        <label className="text-[12px] text-white/40 mb-1.5 block">Reference Solution</label>
                        <textarea {...register(`referenceSolution.${index}.completeCode`)} placeholder={`// Correct logic for ${langName}`} className={codeAreaStyle} />
                        {errors.referenceSolution?.[index]?.completeCode && <span className="text-rose-400 text-[11px]">{errors.referenceSolution[index].completeCode.message}</span>}
                        <input type="hidden" {...register(`referenceSolution.${index}.language`)} value={langName} />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-[12px] text-rose-400/80 font-medium">Test Harness</label>
                        <span className="text-[11px] text-white/30 font-mono bg-white/5 px-2 py-0.5 rounded">
                          Use <code className="text-violet-400">{"{{USER_CODE}}"}</code> as placeholder
                        </span>
                      </div>
                      <textarea {...register(`testHarness.${index}.harnessCode`)} placeholder={`// Full runnable program that reads stdin, calls the user's function, and prints output`} className={`${codeAreaStyle} border-rose-500/20 focus:border-rose-500/40 focus:ring-rose-500/[0.08]`} />
                      {errors.testHarness?.[index]?.harnessCode && <span className="text-rose-400 text-[11px]">{errors.testHarness[index].harnessCode.message}</span>}
                      <input type="hidden" {...register(`testHarness.${index}.language`)} value={langName} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ──────────── SECTION 4: EDITORIAL RESOURCES ──────────── */}
<div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] p-6 shadow-2xl shadow-black/50">
  <div className="flex items-center justify-between mb-6 border-b border-white/[0.06] pb-4">
    <div className="flex items-center gap-2">
      <BookOpen size={16} className="text-violet-400" />
      <h2 className="text-[15px] font-medium text-white/90">Editorial Resources</h2>
    </div>
    <button
      type="button"
      onClick={() => appendEditorial({ type: 'youtube', url: '', title: '', author: '' })}
      className="flex items-center gap-1.5 text-[12px] font-medium text-violet-400 hover:text-violet-300 transition-colors"
    >
      <Plus size={14} /> Add Resource
    </button>
  </div>

  {editorialFields.length === 0 ? (
    <p className="text-[13px] text-white/40 text-center py-4">
      No resources yet. Add YouTube videos, articles, or videos for this problem.
    </p>
  ) : (
    <div className="space-y-3">
      {editorialFields.map((field, index) => (
        <div key={field.id} className="relative p-4 rounded-xl border border-white/[0.04] bg-white/[0.02]">
          <button
            type="button"
            onClick={() => removeEditorial(index)}
            className="absolute top-3 right-3 text-white/20 hover:text-rose-400 transition-colors"
          >
            <Trash2 size={14} />
          </button>
          <div className="grid gap-3">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] text-white/40 block mb-1">Type</label>
                <select
                  {...register(`editorialResources.${index}.type`)}
                  className={inputStyle}
                  style={{ colorScheme: 'dark' }}
                >
                  <option value="youtube">YouTube</option>
                  <option value="article">Article</option>
                  <option value="video">Hosted Video</option>
                  <option value="ai">AI Link</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-[11px] text-white/40 block mb-1">URL</label>
                <input
                  {...register(`editorialResources.${index}.url`)}
                  placeholder="https://youtube.com/watch?v=... or article URL"
                  className={inputStyle}
                />
                {errors.editorialResources?.[index]?.url && (
                  <span className="text-rose-400 text-[11px]">{errors.editorialResources[index].url.message}</span>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-white/40 block mb-1">Title</label>
                <input
                  {...register(`editorialResources.${index}.title`)}
                  placeholder="e.g. Two Sum explained"
                  className={inputStyle}
                />
              </div>
              <div>
                <label className="text-[11px] text-white/40 block mb-1">Author (optional)</label>
                <input
                  {...register(`editorialResources.${index}.author`)}
                  placeholder="e.g. Striver, NeetCode"
                  className={inputStyle}
                />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )}
</div>

          {/* Submit */}
          <div className="flex justify-end pt-4">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-[14px] font-medium transition-all shadow-[0_8px_30px_-8px] shadow-violet-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save size={16} />
              )}
              {isSubmitting ? 'Saving...' : 'Save Problem'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default AdminPanel;