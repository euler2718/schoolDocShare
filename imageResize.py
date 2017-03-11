import os, PIL
from PIL import Image
#from resizeimage import resizeimage

folder_array = ['James House Preschool', 'Kearsarge Regional High School', 'Kearsarge Regional Middle Sch', 'KRES at Bradford', 'KRES at New London', 'Simonds Elementary School', 'Sutton Central Elem School']  
img_folder = "C:\\Users\\jc\\Desktop\\Student FileShare\\Photos\\"
basewidth = 100

for folder in folder_array:
    all_images = os.listdir(img_folder + folder + "\\images")
    for image in all_images:


        
        img = Image.open(img_folder + folder + "\\images\\" + image)
        wpercent = (basewidth/float(img.size[0]))
        hsize = int((float(img.size[1])*float(wpercent)))
        img = img.resize((basewidth,hsize), PIL.Image.ANTIALIAS)
        img.save('Resized\\' + image) 
