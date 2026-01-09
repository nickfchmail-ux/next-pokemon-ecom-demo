'use client';
import { Avatar, AvatarFallback, AvatarImage } from '../_componentAPI/avatar';

import { zodResolver } from '@hookform/resolvers/zod';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { useMutation } from '@tanstack/react-query';
import { Toast } from 'primereact/toast';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { AiOutlineEdit } from 'react-icons/ai';
import { MdOutlineCancel } from 'react-icons/md';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../_componentAPI/form';
import { Input } from '../_componentAPI/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../_componentAPI/select';
import { updateMemberAction } from '../_lib/actions';
const formSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  gender: z.string().min(1, 'Please select a gender'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  image: z.any().optional(),
});

function getFieldName(field) {
  if (!field.includes('_')) return field.at(0).toUpperCase() + field.slice(1);
  return field
    .split('_')
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ');
}

export default function UserProfile({ children }) {
  const [allowEdit, setAllowEdit] = useState(false);
  console.log('user received by user profile page: ', children);
  const { email, ...member } = children;
  const toast = useRef(null);
  const fileInputRef = useRef();
  const [preview, setPreview] = useState(member?.image);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: member?.first_name || '',
      last_name: member?.last_name || '',
      gender: member?.gender || undefined,
      address: member?.address === 'not-provided' ? '' : member?.address,
      image: member?.image || null,
    },
  });

  const {
    mutate: updateUserProfile,
    isPending: isUpdating,
    isSuccess,
  } = useMutation({
    mutationFn: updateMemberAction,
    onSuccess: () => {
      toast.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: 'User profile successfully updated',
        life: 4000,
      });

      setAllowEdit(false);
    },
    onError: (error) => {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: error.message || 'User profile update failed',
        life: 5000,
      });
      console.log(error);
    },
  });
  console.log('isLoading: ', isUpdating);
  console.log('is success', isSuccess);
  const onSubmit = async (data) => {
    const formData = new FormData();
    // Append all data except the image
    Object.keys(data).forEach((key) => {
      if (key !== 'image') {
        formData.append(key, data[key]);
      }
    });
    formData.append('email', email);

    // Handle image separately
    if (data.image instanceof File) {
      formData.append('image', data?.image);
    } else {
      formData.append('image', member.image); // Send back the original URL if no new file
    }

    await updateUserProfile(formData);
  };

  return (
    <div>
      <Toast ref={toast} position="top-center" />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
          <div className={`flex justify-between `}>
            <Avatar className="w-32 h-32 border-4 border-white shadow-md ">
              <AvatarImage src={preview} alt="Profile" />
              <AvatarFallback className="text-4xl">JD</AvatarFallback>
            </Avatar>
            <div className={`flex flex-col gap-2 text-primary-800`}>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setAllowEdit(!allowEdit);
                }}
                className={`flex items-center h-min w-max self-end gap-2 ${
                  allowEdit ? 'bg-blue-400 text-blue-800' : ''
                } transition-all duration-300 px-4 py-2 rounded-2xl flex justify-self-end  ${
                  !allowEdit ? 'hover:text-blue-400' : ''
                } `}
              >
                <AiOutlineEdit /> Edit
              </button>

              {allowEdit && (
                <Button
                  variant="outlined"
                  type="submit"
                  color="success"
                  className=" text-lg p-6  transition-colors rounded-md mt-6 h-min w-[10rem]"
                >
                  {isUpdating ? <CircularProgress size="30px" /> : 'Save Changes'}
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[min-content] mt-2 text-primary-950 font-bold">
            <FormField
              control={form.control}
              name="first_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input disabled={!allowEdit || isUpdating} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="last_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input disabled={!allowEdit || isUpdating} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input disabled={!allowEdit || isUpdating} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={!allowEdit || isUpdating}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="relative">
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profile Image</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        disabled={!allowEdit || isUpdating}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          field.onChange(file); // Update form state
                          if (file) {
                            setPreview(URL.createObjectURL(file));
                          }
                        }}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              {preview !== member.image && preview !== null && allowEdit && !isUpdating ? (
                <button
                  className="absolute right-0 bottom-[.5rem] right-1"
                  onClick={(e) => {
                    setPreview(member?.image);
                    e.preventDefault();
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                      setPreview(null);
                    }
                  }}
                >
                  <MdOutlineCancel className="size-5 text-red-500" />
                </button>
              ) : null}
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
