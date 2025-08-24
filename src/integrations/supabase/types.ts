export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          activity_type: string
          created_at: string
          id: string
          metadata: Json | null
          user_id: string
          xp_earned: number
        }
        Insert: {
          activity_type: string
          created_at?: string
          id?: string
          metadata?: Json | null
          user_id: string
          xp_earned?: number
        }
        Update: {
          activity_type?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          user_id?: string
          xp_earned?: number
        }
        Relationships: []
      }
      answers: {
        Row: {
          answer_text: string | null
          evaluated_at: string | null
          evaluated_by: string | null
          id: string
          is_correct: boolean | null
          question_id: string
          score: number | null
          submission_id: string
        }
        Insert: {
          answer_text?: string | null
          evaluated_at?: string | null
          evaluated_by?: string | null
          id?: string
          is_correct?: boolean | null
          question_id: string
          score?: number | null
          submission_id: string
        }
        Update: {
          answer_text?: string | null
          evaluated_at?: string | null
          evaluated_by?: string | null
          id?: string
          is_correct?: boolean | null
          question_id?: string
          score?: number | null
          submission_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "answers_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "student_test_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      audio_files: {
        Row: {
          class_id: string | null
          course_id: string | null
          created_at: string | null
          description: string | null
          duration: string | null
          file_path: string
          file_size: number | null
          file_type: string | null
          id: string
          is_public: boolean | null
          title: string
          updated_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          class_id?: string | null
          course_id?: string | null
          created_at?: string | null
          description?: string | null
          duration?: string | null
          file_path: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          is_public?: boolean | null
          title: string
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          class_id?: string | null
          course_id?: string | null
          created_at?: string | null
          description?: string | null
          duration?: string | null
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          is_public?: boolean | null
          title?: string
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audio_files_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audio_files_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audio_files_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      badges: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
          tier: string
          type: string
          updated_at: string
          xp_reward: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          tier: string
          type: string
          updated_at?: string
          xp_reward?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          tier?: string
          type?: string
          updated_at?: string
          xp_reward?: number | null
        }
        Relationships: []
      }
      batches: {
        Row: {
          course_id: string | null
          created_at: string | null
          end_date: string | null
          id: string
          instructor_id: string | null
          is_paid: boolean | null
          name: string
          start_date: string | null
        }
        Insert: {
          course_id?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          instructor_id?: string | null
          is_paid?: boolean | null
          name: string
          start_date?: string | null
        }
        Update: {
          course_id?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          instructor_id?: string | null
          is_paid?: boolean | null
          name?: string
          start_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "batches_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      brands: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          logo_url: string | null
          name: string
          updated_at: string
          website_url: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name: string
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name?: string
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_active: boolean
          is_public: boolean
          name: string
          order_index: number
          parent_id: string | null
          slug: string
          thumbnail_url: string | null
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          is_public?: boolean
          name: string
          order_index?: number
          parent_id?: string | null
          slug: string
          thumbnail_url?: string | null
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          is_public?: boolean
          name?: string
          order_index?: number
          parent_id?: string | null
          slug?: string
          thumbnail_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      chapters: {
        Row: {
          created_at: string
          description: string | null
          id: string
          order_index: number
          subject_id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          order_index?: number
          subject_id: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          order_index?: number
          subject_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chapters_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      class_subjects: {
        Row: {
          class_id: string
          created_at: string | null
          id: string
          order_index: number | null
          subject_id: string
          updated_at: string | null
        }
        Insert: {
          class_id: string
          created_at?: string | null
          id?: string
          order_index?: number | null
          subject_id: string
          updated_at?: string | null
        }
        Update: {
          class_id?: string
          created_at?: string | null
          id?: string
          order_index?: number | null
          subject_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "class_subjects_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_subjects_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          order_index: number | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          order_index?: number | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          order_index?: number | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      colleges: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      content_category_mappings: {
        Row: {
          category_id: string
          content_id: string
          content_type: string
          created_at: string
          id: string
        }
        Insert: {
          category_id: string
          content_id: string
          content_type: string
          created_at?: string
          id?: string
        }
        Update: {
          category_id?: string
          content_id?: string
          content_type?: string
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_category_mappings_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      content_entries: {
        Row: {
          author_id: string | null
          content: Json
          created_at: string
          id: string
          published_at: string | null
          slug: string
          status: string
          title: string
          type_id: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          content?: Json
          created_at?: string
          id?: string
          published_at?: string | null
          slug: string
          status?: string
          title: string
          type_id: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          content?: Json
          created_at?: string
          id?: string
          published_at?: string | null
          slug?: string
          status?: string
          title?: string
          type_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_entries_type_id_fkey"
            columns: ["type_id"]
            isOneToOne: false
            referencedRelation: "content_types"
            referencedColumns: ["id"]
          },
        ]
      }
      content_types: {
        Row: {
          created_at: string
          description: string | null
          fields: Json
          id: string
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          fields?: Json
          id?: string
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          fields?: Json
          id?: string
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      content_versions: {
        Row: {
          content: Json
          created_at: string
          created_by: string | null
          entry_id: string
          id: string
        }
        Insert: {
          content: Json
          created_at?: string
          created_by?: string | null
          entry_id: string
          id?: string
        }
        Update: {
          content?: Json
          created_at?: string
          created_by?: string | null
          entry_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_versions_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "content_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      contents: {
        Row: {
          content: string
          created_at: string
          id: string
          title: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          title: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          title?: string
        }
        Relationships: []
      }
      coupon_usage: {
        Row: {
          coupon_id: string
          discount_amount: number
          id: string
          order_id: string | null
          used_at: string | null
          user_id: string
        }
        Insert: {
          coupon_id: string
          discount_amount: number
          id?: string
          order_id?: string | null
          used_at?: string | null
          user_id: string
        }
        Update: {
          coupon_id?: string
          discount_amount?: number
          id?: string
          order_id?: string | null
          used_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coupon_usage_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          applicable_to: string | null
          code: string
          created_at: string | null
          created_by: string | null
          discount_type: string
          discount_value: number
          id: string
          is_active: boolean | null
          minimum_amount: number | null
          updated_at: string | null
          usage_limit: number | null
          used_count: number | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          applicable_to?: string | null
          code: string
          created_at?: string | null
          created_by?: string | null
          discount_type: string
          discount_value: number
          id?: string
          is_active?: boolean | null
          minimum_amount?: number | null
          updated_at?: string | null
          usage_limit?: number | null
          used_count?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          applicable_to?: string | null
          code?: string
          created_at?: string | null
          created_by?: string | null
          discount_type?: string
          discount_value?: number
          id?: string
          is_active?: boolean | null
          minimum_amount?: number | null
          updated_at?: string | null
          usage_limit?: number | null
          used_count?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      course_categories: {
        Row: {
          category_id: string
          course_id: string
          created_at: string
          id: string
        }
        Insert: {
          category_id: string
          course_id: string
          created_at?: string
          id?: string
        }
        Update: {
          category_id?: string
          course_id?: string
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_categories_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_subjects: {
        Row: {
          course_id: string
          created_at: string
          id: string
          order_index: number
          subject_id: string
        }
        Insert: {
          course_id: string
          created_at?: string
          id?: string
          order_index?: number
          subject_id: string
        }
        Update: {
          course_id?: string
          created_at?: string
          id?: string
          order_index?: number
          subject_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_subjects_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_subjects_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          college_id: string | null
          created_at: string | null
          currency: string | null
          description: string | null
          id: string
          instructor_id: string | null
          price: number | null
          subscription_required: boolean | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          college_id?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          instructor_id?: string | null
          price?: number | null
          subscription_required?: boolean | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          college_id?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          instructor_id?: string | null
          price?: number | null
          subscription_required?: boolean | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "courses_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
        ]
      }
      doubt_attachments: {
        Row: {
          content_type: string
          created_at: string | null
          doubt_id: string
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id: string
        }
        Insert: {
          content_type: string
          created_at?: string | null
          doubt_id: string
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id?: string
        }
        Update: {
          content_type?: string
          created_at?: string | null
          doubt_id?: string
          file_name?: string
          file_path?: string
          file_size?: number
          file_type?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "doubt_attachments_doubt_id_fkey"
            columns: ["doubt_id"]
            isOneToOne: false
            referencedRelation: "doubts"
            referencedColumns: ["id"]
          },
        ]
      }
      doubt_categories: {
        Row: {
          created_at: string | null
          id: string
          level: string
          name: string
          parent_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          level: string
          name: string
          parent_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          level?: string
          name?: string
          parent_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "doubt_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "doubt_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      doubt_flags: {
        Row: {
          created_at: string | null
          doubt_id: string
          flag_type: string
          flagged_by: string
          id: string
          notes: string | null
          resolved_at: string | null
          resolved_by: string | null
        }
        Insert: {
          created_at?: string | null
          doubt_id: string
          flag_type: string
          flagged_by: string
          id?: string
          notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
        }
        Update: {
          created_at?: string | null
          doubt_id?: string
          flag_type?: string
          flagged_by?: string
          id?: string
          notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "doubt_flags_doubt_id_fkey"
            columns: ["doubt_id"]
            isOneToOne: false
            referencedRelation: "doubts"
            referencedColumns: ["id"]
          },
        ]
      }
      doubt_ratings: {
        Row: {
          created_at: string | null
          feedback: string | null
          id: string
          rating: number
          reply_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          feedback?: string | null
          id?: string
          rating: number
          reply_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          feedback?: string | null
          id?: string
          rating?: number
          reply_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "doubt_ratings_reply_id_fkey"
            columns: ["reply_id"]
            isOneToOne: false
            referencedRelation: "doubt_replies"
            referencedColumns: ["id"]
          },
        ]
      }
      doubt_replies: {
        Row: {
          content: string
          created_at: string | null
          doubt_id: string
          id: string
          is_ai_response: boolean | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          doubt_id: string
          id?: string
          is_ai_response?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          doubt_id?: string
          id?: string
          is_ai_response?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "doubt_replies_doubt_id_fkey"
            columns: ["doubt_id"]
            isOneToOne: false
            referencedRelation: "doubts"
            referencedColumns: ["id"]
          },
        ]
      }
      doubt_session_participants: {
        Row: {
          created_at: string | null
          doubt_id: string | null
          feedback: string | null
          id: string
          joined_at: string | null
          left_at: string | null
          session_id: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          doubt_id?: string | null
          feedback?: string | null
          id?: string
          joined_at?: string | null
          left_at?: string | null
          session_id: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          doubt_id?: string | null
          feedback?: string | null
          id?: string
          joined_at?: string | null
          left_at?: string | null
          session_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "doubt_session_participants_doubt_id_fkey"
            columns: ["doubt_id"]
            isOneToOne: false
            referencedRelation: "doubts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doubt_session_participants_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "doubt_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      doubt_sessions: {
        Row: {
          created_at: string | null
          description: string | null
          end_time: string
          id: string
          max_students: number | null
          meeting_link: string | null
          session_type: string
          start_time: string
          status: string
          teacher_id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          end_time: string
          id?: string
          max_students?: number | null
          meeting_link?: string | null
          session_type: string
          start_time: string
          status?: string
          teacher_id: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          end_time?: string
          id?: string
          max_students?: number | null
          meeting_link?: string | null
          session_type?: string
          start_time?: string
          status?: string
          teacher_id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      doubts: {
        Row: {
          ai_processed: boolean | null
          assigned_at: string | null
          assigned_to: string | null
          category_id: string | null
          content: string
          created_at: string | null
          id: string
          resolved_at: string | null
          status: string
          subject: string | null
          title: string
          topic: string | null
          updated_at: string | null
          urgency_level: string
          user_id: string
          viewed_at: string | null
        }
        Insert: {
          ai_processed?: boolean | null
          assigned_at?: string | null
          assigned_to?: string | null
          category_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          resolved_at?: string | null
          status?: string
          subject?: string | null
          title: string
          topic?: string | null
          updated_at?: string | null
          urgency_level?: string
          user_id: string
          viewed_at?: string | null
        }
        Update: {
          ai_processed?: boolean | null
          assigned_at?: string | null
          assigned_to?: string | null
          category_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          resolved_at?: string | null
          status?: string
          subject?: string | null
          title?: string
          topic?: string | null
          updated_at?: string | null
          urgency_level?: string
          user_id?: string
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "doubts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "doubt_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      featured_categories: {
        Row: {
          banner_url: string | null
          category_id: string
          created_at: string
          cta_text: string | null
          id: string
          is_active: boolean
          order_index: number
          promotional_text: string | null
          updated_at: string
        }
        Insert: {
          banner_url?: string | null
          category_id: string
          created_at?: string
          cta_text?: string | null
          id?: string
          is_active?: boolean
          order_index?: number
          promotional_text?: string | null
          updated_at?: string
        }
        Update: {
          banner_url?: string | null
          category_id?: string
          created_at?: string
          cta_text?: string | null
          id?: string
          is_active?: boolean
          order_index?: number
          promotional_text?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "featured_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      featured_courses: {
        Row: {
          course_id: string
          created_at: string
          cta_text: string | null
          id: string
          is_active: boolean
          order_index: number
          promotional_text: string | null
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          cta_text?: string | null
          id?: string
          is_active?: boolean
          order_index?: number
          promotional_text?: string | null
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          cta_text?: string | null
          id?: string
          is_active?: boolean
          order_index?: number
          promotional_text?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "featured_courses_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      featured_subjects: {
        Row: {
          created_at: string
          cta_text: string | null
          id: string
          is_active: boolean
          order_index: number
          promotional_text: string | null
          subject_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          cta_text?: string | null
          id?: string
          is_active?: boolean
          order_index?: number
          promotional_text?: string | null
          subject_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          cta_text?: string | null
          id?: string
          is_active?: boolean
          order_index?: number
          promotional_text?: string | null
          subject_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "featured_subjects_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_attachments: {
        Row: {
          content_type: string
          created_at: string | null
          file_name: string
          file_path: string
          file_size: number
          id: string
          post_id: string | null
          thread_id: string | null
          user_id: string
        }
        Insert: {
          content_type: string
          created_at?: string | null
          file_name: string
          file_path: string
          file_size: number
          id?: string
          post_id?: string | null
          thread_id?: string | null
          user_id: string
        }
        Update: {
          content_type?: string
          created_at?: string | null
          file_name?: string
          file_path?: string
          file_size?: number
          id?: string
          post_id?: string | null
          thread_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_attachments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_attachments_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "forum_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_bookmarks: {
        Row: {
          created_at: string | null
          id: string
          thread_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          thread_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          thread_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_bookmarks_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "forum_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean
          name: string
          parent_id: string | null
          reference_id: string | null
          slug: string
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          parent_id?: string | null
          reference_id?: string | null
          slug: string
          type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          parent_id?: string | null
          reference_id?: string | null
          slug?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "forum_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "forum_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_poll_votes: {
        Row: {
          created_at: string | null
          id: string
          option_index: number
          poll_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          option_index: number
          poll_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          option_index?: number
          poll_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_poll_votes_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "forum_polls"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_polls: {
        Row: {
          allow_multiple: boolean
          closes_at: string | null
          created_at: string | null
          id: string
          options: Json
          question: string
          thread_id: string
        }
        Insert: {
          allow_multiple?: boolean
          closes_at?: string | null
          created_at?: string | null
          id?: string
          options: Json
          question: string
          thread_id: string
        }
        Update: {
          allow_multiple?: boolean
          closes_at?: string | null
          created_at?: string | null
          id?: string
          options?: Json
          question?: string
          thread_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_polls_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "forum_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_posts: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_accepted: boolean
          parent_id: string | null
          thread_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_accepted?: boolean
          parent_id?: string | null
          thread_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_accepted?: boolean
          parent_id?: string | null
          thread_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_posts_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_posts_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "forum_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_reports: {
        Row: {
          created_at: string | null
          id: string
          post_id: string | null
          reason: string
          reporter_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          thread_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id?: string | null
          reason: string
          reporter_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          thread_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string | null
          reason?: string
          reporter_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          thread_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "forum_reports_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_reports_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "forum_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_subscriptions: {
        Row: {
          category_id: string | null
          created_at: string | null
          id: string
          tag: string | null
          thread_id: string | null
          user_id: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          id?: string
          tag?: string | null
          thread_id?: string | null
          user_id: string
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          id?: string
          tag?: string | null
          thread_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_subscriptions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "forum_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_subscriptions_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "forum_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_tags: {
        Row: {
          category_id: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_tags_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "forum_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_threads: {
        Row: {
          category_id: string
          content: string
          created_at: string | null
          id: string
          is_locked: boolean
          is_pinned: boolean
          status: string
          tags: string[] | null
          thread_type: string
          title: string
          updated_at: string | null
          user_id: string
          view_count: number
        }
        Insert: {
          category_id: string
          content: string
          created_at?: string | null
          id?: string
          is_locked?: boolean
          is_pinned?: boolean
          status?: string
          tags?: string[] | null
          thread_type?: string
          title: string
          updated_at?: string | null
          user_id: string
          view_count?: number
        }
        Update: {
          category_id?: string
          content?: string
          created_at?: string | null
          id?: string
          is_locked?: boolean
          is_pinned?: boolean
          status?: string
          tags?: string[] | null
          thread_type?: string
          title?: string
          updated_at?: string | null
          user_id?: string
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "forum_threads_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "forum_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_user_metrics: {
        Row: {
          accepted_count: number
          created_at: string | null
          downvotes_received: number
          helpful_count: number
          id: string
          last_active: string | null
          posts_created: number
          reputation_score: number
          threads_created: number
          updated_at: string | null
          upvotes_received: number
          user_id: string
        }
        Insert: {
          accepted_count?: number
          created_at?: string | null
          downvotes_received?: number
          helpful_count?: number
          id?: string
          last_active?: string | null
          posts_created?: number
          reputation_score?: number
          threads_created?: number
          updated_at?: string | null
          upvotes_received?: number
          user_id: string
        }
        Update: {
          accepted_count?: number
          created_at?: string | null
          downvotes_received?: number
          helpful_count?: number
          id?: string
          last_active?: string | null
          posts_created?: number
          reputation_score?: number
          threads_created?: number
          updated_at?: string | null
          upvotes_received?: number
          user_id?: string
        }
        Relationships: []
      }
      forum_user_restrictions: {
        Row: {
          created_at: string | null
          created_by: string
          expires_at: string | null
          id: string
          is_active: boolean
          reason: string | null
          restriction_type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          created_by: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          reason?: string | null
          restriction_type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          reason?: string | null
          restriction_type?: string
          user_id?: string
        }
        Relationships: []
      }
      forum_votes: {
        Row: {
          created_at: string | null
          id: string
          post_id: string | null
          thread_id: string | null
          user_id: string
          vote_type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id?: string | null
          thread_id?: string | null
          user_id: string
          vote_type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string | null
          thread_id?: string | null
          user_id?: string
          vote_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_votes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_votes_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "forum_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          active: boolean | null
          created_at: string | null
          exam_code: string
          icon: string
          id: string
          is_popular: boolean | null
          order_index: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          exam_code: string
          icon: string
          id?: string
          is_popular?: boolean | null
          order_index?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          exam_code?: string
          icon?: string
          id?: string
          is_popular?: boolean | null
          order_index?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      guardian_alerts: {
        Row: {
          alert_type: string
          created_at: string
          guardian_id: string
          id: string
          message: string
          metadata: Json | null
          read_at: string | null
          severity: string
          student_id: string
          title: string
        }
        Insert: {
          alert_type: string
          created_at?: string
          guardian_id: string
          id?: string
          message: string
          metadata?: Json | null
          read_at?: string | null
          severity?: string
          student_id: string
          title: string
        }
        Update: {
          alert_type?: string
          created_at?: string
          guardian_id?: string
          id?: string
          message?: string
          metadata?: Json | null
          read_at?: string | null
          severity?: string
          student_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "guardian_alerts_guardian_id_fkey"
            columns: ["guardian_id"]
            isOneToOne: false
            referencedRelation: "guardians"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guardian_alerts_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      guardian_reports: {
        Row: {
          created_at: string
          guardian_id: string
          id: string
          pdf_url: string | null
          period_end: string
          period_start: string
          report_data: Json
          report_type: string
          shared_at: string | null
          student_id: string
        }
        Insert: {
          created_at?: string
          guardian_id: string
          id?: string
          pdf_url?: string | null
          period_end: string
          period_start: string
          report_data: Json
          report_type: string
          shared_at?: string | null
          student_id: string
        }
        Update: {
          created_at?: string
          guardian_id?: string
          id?: string
          pdf_url?: string | null
          period_end?: string
          period_start?: string
          report_data?: Json
          report_type?: string
          shared_at?: string | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guardian_reports_guardian_id_fkey"
            columns: ["guardian_id"]
            isOneToOne: false
            referencedRelation: "guardians"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guardian_reports_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      guardian_student_links: {
        Row: {
          created_at: string
          guardian_id: string
          id: string
          is_primary: boolean
          relationship_type: string
          student_id: string
          updated_at: string
          verification_code: string | null
          verification_status: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          created_at?: string
          guardian_id: string
          id?: string
          is_primary?: boolean
          relationship_type: string
          student_id: string
          updated_at?: string
          verification_code?: string | null
          verification_status?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          created_at?: string
          guardian_id?: string
          id?: string
          is_primary?: boolean
          relationship_type?: string
          student_id?: string
          updated_at?: string
          verification_code?: string | null
          verification_status?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "guardian_student_links_guardian_id_fkey"
            columns: ["guardian_id"]
            isOneToOne: false
            referencedRelation: "guardians"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guardian_student_links_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      guardians: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          notification_preferences: Json | null
          phone_number: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id?: string
          notification_preferences?: Json | null
          phone_number?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          notification_preferences?: Json | null
          phone_number?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      hand_raises: {
        Row: {
          created_at: string
          id: string
          reason: string | null
          session_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          reason?: string | null
          session_id: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          reason?: string | null
          session_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hand_raises_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "live_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_transactions: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          new_stock: number
          notes: string | null
          previous_stock: number
          product_id: string
          quantity: number
          reference_id: string | null
          reference_type: string | null
          type: string
          variant_id: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          new_stock: number
          notes?: string | null
          previous_stock: number
          product_id: string
          quantity: number
          reference_id?: string | null
          reference_type?: string | null
          type: string
          variant_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          new_stock?: number
          notes?: string | null
          previous_stock?: number
          product_id?: string
          quantity?: number
          reference_id?: string | null
          reference_type?: string | null
          type?: string
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_transactions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_transactions_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      kids_content_categories: {
        Row: {
          age_group: string
          color_gradient: string
          created_at: string
          description: string | null
          icon: string
          id: string
          is_active: boolean
          name: string
          order_index: number
          slug: string
          updated_at: string
        }
        Insert: {
          age_group: string
          color_gradient: string
          created_at?: string
          description?: string | null
          icon: string
          id?: string
          is_active?: boolean
          name: string
          order_index?: number
          slug: string
          updated_at?: string
        }
        Update: {
          age_group?: string
          color_gradient?: string
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          is_active?: boolean
          name?: string
          order_index?: number
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      kids_content_items: {
        Row: {
          category_id: string
          content_data: Json | null
          content_type: string
          content_url: string | null
          created_at: string
          created_by: string | null
          description: string | null
          difficulty_level: string | null
          duration_minutes: number | null
          id: string
          is_active: boolean
          is_featured: boolean
          order_index: number
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category_id: string
          content_data?: Json | null
          content_type: string
          content_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          difficulty_level?: string | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean
          is_featured?: boolean
          order_index?: number
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category_id?: string
          content_data?: Json | null
          content_type?: string
          content_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          difficulty_level?: string | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean
          is_featured?: boolean
          order_index?: number
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "kids_content_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "kids_content_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      kids_favorites: {
        Row: {
          content_item_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          content_item_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          content_item_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "kids_favorites_content_item_id_fkey"
            columns: ["content_item_id"]
            isOneToOne: false
            referencedRelation: "kids_content_items"
            referencedColumns: ["id"]
          },
        ]
      }
      kids_progress: {
        Row: {
          completed_at: string | null
          content_item_id: string
          created_at: string
          id: string
          last_accessed_at: string | null
          progress_percentage: number | null
          time_spent_minutes: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          content_item_id: string
          created_at?: string
          id?: string
          last_accessed_at?: string | null
          progress_percentage?: number | null
          time_spent_minutes?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          content_item_id?: string
          created_at?: string
          id?: string
          last_accessed_at?: string | null
          progress_percentage?: number | null
          time_spent_minutes?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "kids_progress_content_item_id_fkey"
            columns: ["content_item_id"]
            isOneToOne: false
            referencedRelation: "kids_content_items"
            referencedColumns: ["id"]
          },
        ]
      }
      live_chat_messages: {
        Row: {
          created_at: string
          id: string
          is_highlighted: boolean
          message: string
          parent_id: string | null
          session_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_highlighted?: boolean
          message: string
          parent_id?: string | null
          session_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_highlighted?: boolean
          message?: string
          parent_id?: string | null
          session_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "live_chat_messages_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "live_chat_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "live_chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "live_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      live_polls: {
        Row: {
          closed_at: string | null
          created_at: string
          created_by: string
          id: string
          is_active: boolean
          is_multiple_choice: boolean
          options: Json
          question: string
          session_id: string
        }
        Insert: {
          closed_at?: string | null
          created_at?: string
          created_by: string
          id?: string
          is_active?: boolean
          is_multiple_choice?: boolean
          options: Json
          question: string
          session_id: string
        }
        Update: {
          closed_at?: string | null
          created_at?: string
          created_by?: string
          id?: string
          is_active?: boolean
          is_multiple_choice?: boolean
          options?: Json
          question?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "live_polls_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "live_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      live_questions: {
        Row: {
          created_at: string
          id: string
          is_anonymous: boolean
          is_public: boolean
          is_resolved: boolean
          question: string
          resolved_at: string | null
          resolved_by: string | null
          session_id: string
          updated_at: string
          upvote_count: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_anonymous?: boolean
          is_public?: boolean
          is_resolved?: boolean
          question: string
          resolved_at?: string | null
          resolved_by?: string | null
          session_id: string
          updated_at?: string
          upvote_count?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_anonymous?: boolean
          is_public?: boolean
          is_resolved?: boolean
          question?: string
          resolved_at?: string | null
          resolved_by?: string | null
          session_id?: string
          updated_at?: string
          upvote_count?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "live_questions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "live_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      live_quizzes: {
        Row: {
          closed_at: string | null
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_active: boolean
          session_id: string
          time_limit: number | null
          title: string
        }
        Insert: {
          closed_at?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_active?: boolean
          session_id: string
          time_limit?: number | null
          title: string
        }
        Update: {
          closed_at?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_active?: boolean
          session_id?: string
          time_limit?: number | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "live_quizzes_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "live_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      live_reactions: {
        Row: {
          id: string
          reaction_type: string
          session_id: string
          timestamp: string
          user_id: string
        }
        Insert: {
          id?: string
          reaction_type: string
          session_id: string
          timestamp?: string
          user_id: string
        }
        Update: {
          id?: string
          reaction_type?: string
          session_id?: string
          timestamp?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "live_reactions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "live_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      live_sessions: {
        Row: {
          access_level: string | null
          actual_end_time: string | null
          actual_start_time: string | null
          batch_id: string | null
          chat_enabled: boolean | null
          course_id: string | null
          created_at: string | null
          description: string | null
          enable_chat: boolean
          enable_hand_raises: boolean
          enable_questions: boolean
          enable_reactions: boolean
          id: string
          instructor_id: string | null
          is_active: boolean | null
          moderators: string[] | null
          recorded_url: string | null
          scheduled_end_time: string | null
          scheduled_start_time: string | null
          status: string | null
          stream_url: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          access_level?: string | null
          actual_end_time?: string | null
          actual_start_time?: string | null
          batch_id?: string | null
          chat_enabled?: boolean | null
          course_id?: string | null
          created_at?: string | null
          description?: string | null
          enable_chat?: boolean
          enable_hand_raises?: boolean
          enable_questions?: boolean
          enable_reactions?: boolean
          id?: string
          instructor_id?: string | null
          is_active?: boolean | null
          moderators?: string[] | null
          recorded_url?: string | null
          scheduled_end_time?: string | null
          scheduled_start_time?: string | null
          status?: string | null
          stream_url?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          access_level?: string | null
          actual_end_time?: string | null
          actual_start_time?: string | null
          batch_id?: string | null
          chat_enabled?: boolean | null
          course_id?: string | null
          created_at?: string | null
          description?: string | null
          enable_chat?: boolean
          enable_hand_raises?: boolean
          enable_questions?: boolean
          enable_reactions?: boolean
          id?: string
          instructor_id?: string | null
          is_active?: boolean | null
          moderators?: string[] | null
          recorded_url?: string | null
          scheduled_end_time?: string | null
          scheduled_start_time?: string | null
          status?: string | null
          stream_url?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "live_sessions_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "live_sessions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_campaign_logs: {
        Row: {
          campaign_id: string
          created_at: string | null
          event_data: Json | null
          id: string
          status: string
          subscriber_id: string
        }
        Insert: {
          campaign_id: string
          created_at?: string | null
          event_data?: Json | null
          id?: string
          status: string
          subscriber_id: string
        }
        Update: {
          campaign_id?: string
          created_at?: string | null
          event_data?: Json | null
          id?: string
          status?: string
          subscriber_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "newsletter_campaign_logs_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "newsletter_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "newsletter_campaign_logs_subscriber_id_fkey"
            columns: ["subscriber_id"]
            isOneToOne: false
            referencedRelation: "newsletter_subscribers"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_campaigns: {
        Row: {
          clicked_count: number | null
          content: string
          created_at: string | null
          created_by: string
          html_content: string | null
          id: string
          opened_count: number | null
          recipient_count: number | null
          scheduled_at: string | null
          sent_at: string | null
          status: string
          subject: string
          title: string
          updated_at: string | null
        }
        Insert: {
          clicked_count?: number | null
          content: string
          created_at?: string | null
          created_by: string
          html_content?: string | null
          id?: string
          opened_count?: number | null
          recipient_count?: number | null
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string
          subject: string
          title: string
          updated_at?: string | null
        }
        Update: {
          clicked_count?: number | null
          content?: string
          created_at?: string | null
          created_by?: string
          html_content?: string | null
          id?: string
          opened_count?: number | null
          recipient_count?: number | null
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string
          subject?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          email: string
          id: string
          metadata: Json | null
          source: string | null
          status: string
          subscribed_at: string | null
          tags: string[] | null
          unsubscribed_at: string | null
          user_id: string | null
        }
        Insert: {
          email: string
          id?: string
          metadata?: Json | null
          source?: string | null
          status?: string
          subscribed_at?: string | null
          tags?: string[] | null
          unsubscribed_at?: string | null
          user_id?: string | null
        }
        Update: {
          email?: string
          id?: string
          metadata?: Json | null
          source?: string | null
          status?: string
          subscribed_at?: string | null
          tags?: string[] | null
          unsubscribed_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      note_access: {
        Row: {
          access_level: string
          created_at: string
          id: string
          note_id: string | null
          role: string
        }
        Insert: {
          access_level: string
          created_at?: string
          id?: string
          note_id?: string | null
          role: string
        }
        Update: {
          access_level?: string
          created_at?: string
          id?: string
          note_id?: string | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "note_access_note_id_fkey"
            columns: ["note_id"]
            isOneToOne: false
            referencedRelation: "note_files"
            referencedColumns: ["id"]
          },
        ]
      }
      note_files: {
        Row: {
          chapter_id: string | null
          created_at: string
          description: string | null
          download_count: number | null
          file_path: string
          file_size: number
          file_type: string
          id: string
          is_public: boolean | null
          title: string
          updated_at: string
          uploaded_by: string | null
          view_count: number | null
        }
        Insert: {
          chapter_id?: string | null
          created_at?: string
          description?: string | null
          download_count?: number | null
          file_path: string
          file_size: number
          file_type: string
          id?: string
          is_public?: boolean | null
          title: string
          updated_at?: string
          uploaded_by?: string | null
          view_count?: number | null
        }
        Update: {
          chapter_id?: string | null
          created_at?: string
          description?: string | null
          download_count?: number | null
          file_path?: string
          file_size?: number
          file_type?: string
          id?: string
          is_public?: boolean | null
          title?: string
          updated_at?: string
          uploaded_by?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "note_files_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      note_tags: {
        Row: {
          note_id: string
          tag_id: string
        }
        Insert: {
          note_id: string
          tag_id: string
        }
        Update: {
          note_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "note_tags_note_id_fkey"
            columns: ["note_id"]
            isOneToOne: false
            referencedRelation: "note_files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "note_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          product_id: string
          product_snapshot: Json | null
          quantity: number
          total_price: number
          unit_price: number
          variant_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          product_id: string
          product_snapshot?: Json | null
          quantity: number
          total_price: number
          unit_price: number
          variant_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          product_id?: string
          product_snapshot?: Json | null
          quantity?: number
          total_price?: number
          unit_price?: number
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          billing_address: Json
          created_at: string
          currency: string
          delivered_at: string | null
          discount_amount: number
          id: string
          notes: string | null
          order_number: string
          payment_id: string | null
          payment_method: string | null
          payment_status: string
          shipped_at: string | null
          shipping_address: Json
          shipping_amount: number
          status: string
          subtotal: number
          tax_amount: number
          total_amount: number
          tracking_number: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          billing_address: Json
          created_at?: string
          currency?: string
          delivered_at?: string | null
          discount_amount?: number
          id?: string
          notes?: string | null
          order_number: string
          payment_id?: string | null
          payment_method?: string | null
          payment_status?: string
          shipped_at?: string | null
          shipping_address: Json
          shipping_amount?: number
          status?: string
          subtotal: number
          tax_amount?: number
          total_amount: number
          tracking_number?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          billing_address?: Json
          created_at?: string
          currency?: string
          delivered_at?: string | null
          discount_amount?: number
          id?: string
          notes?: string | null
          order_number?: string
          payment_id?: string | null
          payment_method?: string | null
          payment_status?: string
          shipped_at?: string | null
          shipping_address?: Json
          shipping_amount?: number
          status?: string
          subtotal?: number
          tax_amount?: number
          total_amount?: number
          tracking_number?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      parent_teacher_meetings: {
        Row: {
          created_at: string
          duration_minutes: number
          guardian_id: string
          id: string
          meeting_date: string
          meeting_link: string | null
          meeting_type: string
          notes: string | null
          status: string
          student_id: string
          teacher_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          duration_minutes?: number
          guardian_id: string
          id?: string
          meeting_date: string
          meeting_link?: string | null
          meeting_type?: string
          notes?: string | null
          status?: string
          student_id: string
          teacher_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          duration_minutes?: number
          guardian_id?: string
          id?: string
          meeting_date?: string
          meeting_link?: string | null
          meeting_type?: string
          notes?: string | null
          status?: string
          student_id?: string
          teacher_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "parent_teacher_meetings_guardian_id_fkey"
            columns: ["guardian_id"]
            isOneToOne: false
            referencedRelation: "guardians"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parent_teacher_meetings_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parent_teacher_meetings_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      parent_teacher_messages: {
        Row: {
          attachments: Json | null
          created_at: string
          guardian_id: string
          id: string
          message: string
          read_at: string | null
          student_id: string
          teacher_id: string
        }
        Insert: {
          attachments?: Json | null
          created_at?: string
          guardian_id: string
          id?: string
          message: string
          read_at?: string | null
          student_id: string
          teacher_id: string
        }
        Update: {
          attachments?: Json | null
          created_at?: string
          guardian_id?: string
          id?: string
          message?: string
          read_at?: string | null
          student_id?: string
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "parent_teacher_messages_guardian_id_fkey"
            columns: ["guardian_id"]
            isOneToOne: false
            referencedRelation: "guardians"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parent_teacher_messages_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parent_teacher_messages_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      poll_responses: {
        Row: {
          created_at: string
          id: string
          poll_id: string
          selected_options: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          poll_id: string
          selected_options: Json
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          poll_id?: string
          selected_options?: Json
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "poll_responses_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "live_polls"
            referencedColumns: ["id"]
          },
        ]
      }
      product_categories: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          order_index: number
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          order_index?: number
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          order_index?: number
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      product_images: {
        Row: {
          alt_text: string | null
          created_at: string
          id: string
          image_url: string
          is_primary: boolean
          order_index: number
          product_id: string
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          id?: string
          image_url: string
          is_primary?: boolean
          order_index?: number
          product_id: string
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          id?: string
          image_url?: string
          is_primary?: boolean
          order_index?: number
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_reviews: {
        Row: {
          comment: string | null
          created_at: string
          helpful_count: number
          id: string
          is_approved: boolean
          is_verified_purchase: boolean
          order_id: string | null
          product_id: string
          rating: number
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          helpful_count?: number
          id?: string
          is_approved?: boolean
          is_verified_purchase?: boolean
          order_id?: string | null
          product_id: string
          rating: number
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          helpful_count?: number
          id?: string
          is_approved?: boolean
          is_verified_purchase?: boolean
          order_id?: string | null
          product_id?: string
          rating?: number
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          attributes: Json | null
          created_at: string
          id: string
          is_active: boolean
          name: string
          price: number | null
          product_id: string
          sku: string | null
          stock_quantity: number
          updated_at: string
        }
        Insert: {
          attributes?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          price?: number | null
          product_id: string
          sku?: string | null
          stock_quantity?: number
          updated_at?: string
        }
        Update: {
          attributes?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          price?: number | null
          product_id?: string
          sku?: string | null
          stock_quantity?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          brand_id: string | null
          category_id: string | null
          cost_price: number | null
          created_at: string
          created_by: string | null
          currency: string
          description: string | null
          dimensions: Json | null
          features: string[] | null
          id: string
          is_active: boolean
          is_digital: boolean
          is_featured: boolean
          low_stock_threshold: number | null
          meta_description: string | null
          meta_title: string | null
          name: string
          original_price: number | null
          price: number
          seller_id: string | null
          short_description: string | null
          sku: string | null
          specifications: Json | null
          stock_quantity: number
          tags: string[] | null
          updated_at: string
          weight: number | null
        }
        Insert: {
          brand_id?: string | null
          category_id?: string | null
          cost_price?: number | null
          created_at?: string
          created_by?: string | null
          currency?: string
          description?: string | null
          dimensions?: Json | null
          features?: string[] | null
          id?: string
          is_active?: boolean
          is_digital?: boolean
          is_featured?: boolean
          low_stock_threshold?: number | null
          meta_description?: string | null
          meta_title?: string | null
          name: string
          original_price?: number | null
          price: number
          seller_id?: string | null
          short_description?: string | null
          sku?: string | null
          specifications?: Json | null
          stock_quantity?: number
          tags?: string[] | null
          updated_at?: string
          weight?: number | null
        }
        Update: {
          brand_id?: string | null
          category_id?: string | null
          cost_price?: number | null
          created_at?: string
          created_by?: string | null
          currency?: string
          description?: string | null
          dimensions?: Json | null
          features?: string[] | null
          id?: string
          is_active?: boolean
          is_digital?: boolean
          is_featured?: boolean
          low_stock_threshold?: number | null
          meta_description?: string | null
          meta_title?: string | null
          name?: string
          original_price?: number | null
          price?: number
          seller_id?: string | null
          short_description?: string | null
          sku?: string | null
          specifications?: Json | null
          stock_quantity?: number
          tags?: string[] | null
          updated_at?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          class_id: string | null
          college_id: string | null
          created_at: string
          full_name: string | null
          id: string
          role: string
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          class_id?: string | null
          college_id?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          role?: string
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          class_id?: string | null
          college_id?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          role?: string
          updated_at?: string
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
        ]
      }
      question_upvotes: {
        Row: {
          created_at: string
          id: string
          question_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          question_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          question_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_upvotes_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "live_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          correct_answer: string
          created_at: string | null
          id: string
          marks: number
          negative_marks: number
          options: Json | null
          question_text: string
          test_id: string
          type: string
        }
        Insert: {
          correct_answer: string
          created_at?: string | null
          id?: string
          marks?: number
          negative_marks?: number
          options?: Json | null
          question_text: string
          test_id: string
          type: string
        }
        Update: {
          correct_answer?: string
          created_at?: string | null
          id?: string
          marks?: number
          negative_marks?: number
          options?: Json | null
          question_text?: string
          test_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "questions_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "tests"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_questions: {
        Row: {
          correct_option: number
          created_at: string
          id: string
          options: Json
          order_index: number
          points: number
          question: string
          quiz_id: string
        }
        Insert: {
          correct_option: number
          created_at?: string
          id?: string
          options: Json
          order_index?: number
          points?: number
          question: string
          quiz_id: string
        }
        Update: {
          correct_option?: number
          created_at?: string
          id?: string
          options?: Json
          order_index?: number
          points?: number
          question?: string
          quiz_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "live_quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_responses: {
        Row: {
          created_at: string
          id: string
          is_correct: boolean | null
          points_earned: number | null
          question_id: string
          selected_option: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_correct?: boolean | null
          points_earned?: number | null
          question_id: string
          selected_option?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_correct?: boolean | null
          points_earned?: number | null
          question_id?: string
          selected_option?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_responses_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "quiz_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_codes: {
        Row: {
          code: string
          created_at: string | null
          id: string
          is_active: boolean | null
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      referral_rewards: {
        Row: {
          coupon_code: string | null
          created_at: string | null
          id: string
          referral_id: string
          reward_amount: number
          reward_method: string
          reward_type: string
          user_id: string
        }
        Insert: {
          coupon_code?: string | null
          created_at?: string | null
          id?: string
          referral_id: string
          reward_amount: number
          reward_method: string
          reward_type: string
          user_id: string
        }
        Update: {
          coupon_code?: string | null
          created_at?: string | null
          id?: string
          referral_id?: string
          reward_amount?: number
          reward_method?: string
          reward_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_rewards_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "referrals"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          created_at: string | null
          id: string
          referee_id: string
          referee_reward_amount: number | null
          referee_rewarded: boolean | null
          referral_code: string
          referrer_id: string
          referrer_reward_amount: number | null
          referrer_rewarded: boolean | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          referee_id: string
          referee_reward_amount?: number | null
          referee_rewarded?: boolean | null
          referral_code: string
          referrer_id: string
          referrer_reward_amount?: number | null
          referrer_rewarded?: boolean | null
        }
        Update: {
          created_at?: string | null
          id?: string
          referee_id?: string
          referee_reward_amount?: number | null
          referee_rewarded?: boolean | null
          referral_code?: string
          referrer_id?: string
          referrer_reward_amount?: number | null
          referrer_rewarded?: boolean | null
        }
        Relationships: []
      }
      reply_attachments: {
        Row: {
          content_type: string
          created_at: string | null
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id: string
          reply_id: string
        }
        Insert: {
          content_type: string
          created_at?: string | null
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id?: string
          reply_id: string
        }
        Update: {
          content_type?: string
          created_at?: string | null
          file_name?: string
          file_path?: string
          file_size?: number
          file_type?: string
          id?: string
          reply_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reply_attachments_reply_id_fkey"
            columns: ["reply_id"]
            isOneToOne: false
            referencedRelation: "doubt_replies"
            referencedColumns: ["id"]
          },
        ]
      }
      schools: {
        Row: {
          assembly_vidhansabha: string | null
          block: string | null
          board_code: string | null
          board_type: string | null
          habitation: string | null
          id: number
          jsk: string | null
          pincode: string | null
          sankul_aeo_code: string | null
          school_category_details: string | null
          school_incharge_designation: string | null
          school_incharge_email_id: string | null
          school_incharge_mobile_no: string | null
          school_incharge_name: string | null
          school_incharge_unique_id: string | null
          school_management_group_details: string | null
          school_medium: string | null
          school_name: string | null
          school_udise_code: string | null
          sr_no: string | null
          tehsil: string | null
          village_ward: string | null
        }
        Insert: {
          assembly_vidhansabha?: string | null
          block?: string | null
          board_code?: string | null
          board_type?: string | null
          habitation?: string | null
          id?: number
          jsk?: string | null
          pincode?: string | null
          sankul_aeo_code?: string | null
          school_category_details?: string | null
          school_incharge_designation?: string | null
          school_incharge_email_id?: string | null
          school_incharge_mobile_no?: string | null
          school_incharge_name?: string | null
          school_incharge_unique_id?: string | null
          school_management_group_details?: string | null
          school_medium?: string | null
          school_name?: string | null
          school_udise_code?: string | null
          sr_no?: string | null
          tehsil?: string | null
          village_ward?: string | null
        }
        Update: {
          assembly_vidhansabha?: string | null
          block?: string | null
          board_code?: string | null
          board_type?: string | null
          habitation?: string | null
          id?: number
          jsk?: string | null
          pincode?: string | null
          sankul_aeo_code?: string | null
          school_category_details?: string | null
          school_incharge_designation?: string | null
          school_incharge_email_id?: string | null
          school_incharge_mobile_no?: string | null
          school_incharge_name?: string | null
          school_incharge_unique_id?: string | null
          school_management_group_details?: string | null
          school_medium?: string | null
          school_name?: string | null
          school_udise_code?: string | null
          sr_no?: string | null
          tehsil?: string | null
          village_ward?: string | null
        }
        Relationships: []
      }
      seller_applications: {
        Row: {
          applied_at: string | null
          business_address: Json
          business_documents: Json | null
          business_email: string
          business_name: string
          business_phone: string
          business_registration_number: string | null
          id: string
          rejected_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          user_id: string
        }
        Insert: {
          applied_at?: string | null
          business_address: Json
          business_documents?: Json | null
          business_email: string
          business_name: string
          business_phone: string
          business_registration_number?: string | null
          id?: string
          rejected_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          user_id: string
        }
        Update: {
          applied_at?: string | null
          business_address?: Json
          business_documents?: Json | null
          business_email?: string
          business_name?: string
          business_phone?: string
          business_registration_number?: string | null
          id?: string
          rejected_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      session_engagement: {
        Row: {
          attention_data: Json | null
          engagement_score: number | null
          id: string
          join_time: string
          leave_time: string | null
          poll_participations: number | null
          questions_asked: number | null
          quiz_participations: number | null
          reactions_given: number | null
          session_id: string
          user_id: string
        }
        Insert: {
          attention_data?: Json | null
          engagement_score?: number | null
          id?: string
          join_time?: string
          leave_time?: string | null
          poll_participations?: number | null
          questions_asked?: number | null
          quiz_participations?: number | null
          reactions_given?: number | null
          session_id: string
          user_id: string
        }
        Update: {
          attention_data?: Json | null
          engagement_score?: number | null
          id?: string
          join_time?: string
          leave_time?: string | null
          poll_participations?: number | null
          questions_asked?: number | null
          quiz_participations?: number | null
          reactions_given?: number | null
          session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_engagement_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "live_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      shopping_cart: {
        Row: {
          added_at: string
          id: string
          product_id: string
          quantity: number
          updated_at: string
          user_id: string
          variant_id: string | null
        }
        Insert: {
          added_at?: string
          id?: string
          product_id: string
          quantity?: number
          updated_at?: string
          user_id: string
          variant_id?: string | null
        }
        Update: {
          added_at?: string
          id?: string
          product_id?: string
          quantity?: number
          updated_at?: string
          user_id?: string
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shopping_cart_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shopping_cart_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      similar_doubts: {
        Row: {
          created_at: string | null
          doubt_id: string
          id: string
          similar_doubt_id: string
          similarity_score: number
        }
        Insert: {
          created_at?: string | null
          doubt_id: string
          id?: string
          similar_doubt_id: string
          similarity_score: number
        }
        Update: {
          created_at?: string | null
          doubt_id?: string
          id?: string
          similar_doubt_id?: string
          similarity_score?: number
        }
        Relationships: [
          {
            foreignKeyName: "similar_doubts_doubt_id_fkey"
            columns: ["doubt_id"]
            isOneToOne: false
            referencedRelation: "doubts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "similar_doubts_similar_doubt_id_fkey"
            columns: ["similar_doubt_id"]
            isOneToOne: false
            referencedRelation: "doubts"
            referencedColumns: ["id"]
          },
        ]
      }
      student_test_submissions: {
        Row: {
          evaluated: boolean | null
          id: string
          student_id: string
          submitted_at: string | null
          test_id: string
          total_score: number | null
        }
        Insert: {
          evaluated?: boolean | null
          id?: string
          student_id: string
          submitted_at?: string | null
          test_id: string
          total_score?: number | null
        }
        Update: {
          evaluated?: boolean | null
          id?: string
          student_id?: string
          submitted_at?: string | null
          test_id?: string
          total_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "student_test_submissions_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "tests"
            referencedColumns: ["id"]
          },
        ]
      }
      study_plan_items: {
        Row: {
          content_id: string | null
          content_type: string
          created_at: string
          day_number: number
          description: string | null
          id: string
          order_index: number
          plan_id: string
          title: string
        }
        Insert: {
          content_id?: string | null
          content_type: string
          created_at?: string
          day_number: number
          description?: string | null
          id?: string
          order_index?: number
          plan_id: string
          title: string
        }
        Update: {
          content_id?: string | null
          content_type?: string
          created_at?: string
          day_number?: number
          description?: string | null
          id?: string
          order_index?: number
          plan_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_plan_items_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "study_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      study_plans: {
        Row: {
          created_at: string
          description: string | null
          duration_days: number | null
          id: string
          is_published: boolean
          subject_id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_days?: number | null
          id?: string
          is_published?: boolean
          subject_id: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_days?: number | null
          id?: string
          is_published?: boolean
          subject_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_plans_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      subject_resources: {
        Row: {
          chapter_id: string | null
          created_at: string
          description: string | null
          external_url: string | null
          file_name: string | null
          file_size: number | null
          file_type: string | null
          file_url: string | null
          id: string
          is_published: boolean
          order_index: number
          resource_type: string
          subject_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          chapter_id?: string | null
          created_at?: string
          description?: string | null
          external_url?: string | null
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          is_published?: boolean
          order_index?: number
          resource_type: string
          subject_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          chapter_id?: string | null
          created_at?: string
          description?: string | null
          external_url?: string | null
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          is_published?: boolean
          order_index?: number
          resource_type?: string
          subject_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subject_resources_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subject_resources_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          college_id: string | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_featured: boolean
          thumbnail_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          college_id?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_featured?: boolean
          thumbnail_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          college_id?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_featured?: boolean
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subjects_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          created_at: string
          id: string
          name: string
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          type: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          type?: string
        }
        Relationships: []
      }
      tests: {
        Row: {
          created_at: string | null
          created_by: string
          description: string | null
          duration_minutes: number
          id: string
          is_published: boolean | null
          level_of_strictness: number
          scheduled_at: string | null
          title: string
          type: string
        }
        Insert: {
          created_at?: string | null
          created_by: string
          description?: string | null
          duration_minutes: number
          id?: string
          is_published?: boolean | null
          level_of_strictness?: number
          scheduled_at?: string | null
          title: string
          type: string
        }
        Update: {
          created_at?: string | null
          created_by?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          is_published?: boolean | null
          level_of_strictness?: number
          scheduled_at?: string | null
          title?: string
          type?: string
        }
        Relationships: []
      }
      user_addresses: {
        Row: {
          address_line_1: string
          address_line_2: string | null
          city: string
          country: string
          created_at: string
          id: string
          is_default: boolean
          name: string
          phone: string | null
          postal_code: string
          state: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          address_line_1: string
          address_line_2?: string | null
          city: string
          country?: string
          created_at?: string
          id?: string
          is_default?: boolean
          name: string
          phone?: string | null
          postal_code: string
          state: string
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          address_line_1?: string
          address_line_2?: string | null
          city?: string
          country?: string
          created_at?: string
          id?: string
          is_default?: boolean
          name?: string
          phone?: string | null
          postal_code?: string
          state?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          awarded_at: string
          badge_id: string
          id: string
          user_id: string
        }
        Insert: {
          awarded_at?: string
          badge_id: string
          id?: string
          user_id: string
        }
        Update: {
          awarded_at?: string
          badge_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_batches: {
        Row: {
          access_expiry_date: string | null
          batch_id: string | null
          enrollment_date: string | null
          grace_period_end_date: string | null
          has_purchased: boolean | null
          has_subscription: boolean | null
          id: string
          user_id: string | null
        }
        Insert: {
          access_expiry_date?: string | null
          batch_id?: string | null
          enrollment_date?: string | null
          grace_period_end_date?: string | null
          has_purchased?: boolean | null
          has_subscription?: boolean | null
          id?: string
          user_id?: string | null
        }
        Update: {
          access_expiry_date?: string | null
          batch_id?: string | null
          enrollment_date?: string | null
          grace_period_end_date?: string | null
          has_purchased?: boolean | null
          has_subscription?: boolean | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_batches_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
        ]
      }
      user_courses: {
        Row: {
          course_id: string
          created_at: string | null
          id: string
          payment_amount: number | null
          payment_id: string | null
          purchase_date: string | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          course_id: string
          created_at?: string | null
          id?: string
          payment_amount?: number | null
          payment_id?: string | null
          purchase_date?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          course_id?: string
          created_at?: string | null
          id?: string
          payment_amount?: number | null
          payment_id?: string | null
          purchase_date?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_courses_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      user_streaks: {
        Row: {
          created_at: string
          current_streak: number
          id: string
          last_activity_date: string
          longest_streak: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_streak?: number
          id?: string
          last_activity_date?: string
          longest_streak?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_streak?: number
          id?: string
          last_activity_date?: string
          longest_streak?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_xp: {
        Row: {
          created_at: string
          id: string
          level: number
          total_xp: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          level?: number
          total_xp?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          level?: number
          total_xp?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      videos: {
        Row: {
          access_level: string | null
          batch_id: string | null
          course_id: string | null
          created_at: string | null
          description: string | null
          duration: number | null
          id: string
          is_live_recording: boolean | null
          live_session_id: string | null
          prerequisites: Json | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          video_url: string
        }
        Insert: {
          access_level?: string | null
          batch_id?: string | null
          course_id?: string | null
          created_at?: string | null
          description?: string | null
          duration?: number | null
          id?: string
          is_live_recording?: boolean | null
          live_session_id?: string | null
          prerequisites?: Json | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          video_url: string
        }
        Update: {
          access_level?: string | null
          batch_id?: string | null
          course_id?: string | null
          created_at?: string | null
          description?: string | null
          duration?: number | null
          id?: string
          is_live_recording?: boolean | null
          live_session_id?: string | null
          prerequisites?: Json | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          video_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "videos_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "videos_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "videos_live_session_id_fkey"
            columns: ["live_session_id"]
            isOneToOne: false
            referencedRelation: "live_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      wishlist: {
        Row: {
          added_at: string
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          added_at?: string
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          added_at?: string
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_product_rating: {
        Args: { product_uuid: string }
        Returns: number
      }
      create_guardian_alert: {
        Args: {
          p_student_id: string
          p_alert_type: string
          p_severity: string
          p_title: string
          p_message: string
          p_metadata?: Json
        }
        Returns: undefined
      }
      generate_order_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_products_with_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          name: string
          description: string
          price: number
          original_price: number
          currency: string
          stock_quantity: number
          is_active: boolean
          is_featured: boolean
          category_name: string
          brand_name: string
          primary_image_url: string
          rating: number
          review_count: number
          features: string[]
          tags: string[]
        }[]
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: string
      }
      has_role: {
        Args: { user_id: string; required_role: string }
        Returns: boolean
      }
      increment_note_download_count: {
        Args: { note_id: string }
        Returns: undefined
      }
      increment_note_view_count: {
        Args: { note_id: string }
        Returns: undefined
      }
      increment_thread_view_count: {
        Args: { thread_id: string }
        Returns: undefined
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_teacher_or_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      unsubscribe_from_newsletter: {
        Args: { subscriber_email: string }
        Returns: boolean
      }
      verify_guardian_student_link: {
        Args: { p_verification_code: string; p_guardian_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "editor" | "teacher" | "student"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "editor", "teacher", "student"],
    },
  },
} as const
